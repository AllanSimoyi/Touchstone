import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { CreateOrDeleteEventDetails } from '~/models/events';

import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { z } from 'zod';

import {
  ActionContextProvider,
  useForm,
} from '~/components/ActionContextProvider';
import { RouteErrorBoundary } from '~/components/Boundaries';
import { Card } from '~/components/Card';
import { CardHeader } from '~/components/CardHeader';
import { CenteredView } from '~/components/CenteredView';
import { Footer } from '~/components/Footer';
import { FormSelect } from '~/components/FormSelect';
import { FormTextField } from '~/components/FormTextField';
import { InlineAlert } from '~/components/InlineAlert';
import { PrimaryButton } from '~/components/PrimaryButton';
import { Toolbar } from '~/components/Toolbar';
import { prisma } from '~/db.server';
import { badRequest, processBadRequest } from '~/models/core.validations';
import { getErrorMessage } from '~/models/errors';
import { EventKind } from '~/models/events';
import { getRawFormFields, hasFormError } from '~/models/forms';
import { AppLinks } from '~/models/links';
import { customLog } from '~/models/logger';
import {
  customServerLog,
  logActionData,
  logParseError,
} from '~/models/logger.server';
import { AccessLevelSchema, accessLevels } from '~/models/user.validations';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  return json(null);
}

const Schema = z
  .object({
    accessLevel: AccessLevelSchema,
    username: z
      .string()
      .min(1, 'Enter the username')
      .max(50, 'Use less than 50 characters for the username'),
    password: z
      .string()
      .min(1, 'Enter the password')
      .max(20, 'Use less than 20 characters for the password'),
    reEnteredPassword: z
      .string()
      .min(1, 'Re-enter the password')
      .max(20, 'Use less than 20 characters for the re-entered password'),
  })
  .refine((data) => data.password === data.reEnteredPassword, {
    message: "Passwords don't match",
    path: ['reEnteredPassword'],
  });
export const action = async ({ request }: ActionArgs) => {
  const currentUserId = await requireUserId(request);

  try {
    const fields = await getRawFormFields(request);
    const result = Schema.safeParse(fields);
    if (!result.success) {
      fields['password'] = '';
      fields['reEnteredPassword'] = '';
      logParseError(request, result.error, fields);
      return processBadRequest(result.error, fields);
    }
    const { accessLevel, username, password } = result.data;
    logActionData(request, { accessLevel, username });

    const numDuplicates = await prisma.user.count({
      where: { username },
    });
    if (numDuplicates) {
      customLog('info', 'Attempted to use existing username for new user', {
        username,
      });
      return badRequest({
        fieldErrors: { username: ['A user with that username already exists'] },
      });
    }

    await prisma.$transaction(async (tx) => {
      const { id } = await tx.user.create({
        data: { accessLevel, username, password },
      });
      const details: CreateOrDeleteEventDetails = {
        accessLevel,
        username,
      };
      await tx.userEvent.create({
        data: {
          recordId: id,
          userId: currentUserId,
          details: JSON.stringify(details),
          kind: EventKind.Create,
        },
      });
    });
    customLog('info', 'New user created', { accessLevel, username });

    return redirect(AppLinks.Users);
  } catch (error) {
    const formError =
      getErrorMessage(error) ||
      'Something went wrong recording customer, please try again';
    customServerLog('error', formError, {}, request);
    return badRequest({ formError });
  }
};

export default function CreateUserPage() {
  const user = useUser();
  useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { getNameProp, isProcessing } = useForm(actionData, Schema);

  // const defaultValues: Record<keyof z.infer<typeof Schema>, string> = {
  //   accessLevel: accessLevels[0],
  //   username: faker.internet.userName(),
  //   password: 'default@7891',
  //   reEnteredPassword: 'default@7891',
  // };

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      {hasFormError(actionData) && (
        <div className="fixed bottom-0 left-0 flex flex-col items-center justify-center p-2">
          <InlineAlert>{actionData.formError}</InlineAlert>
        </div>
      )}
      <Form method="post" className="flex grow flex-col items-stretch py-6">
        <ActionContextProvider
          {...actionData}
          // fields={defaultValues}
          isSubmitting={isProcessing}
        >
          <CenteredView className="w-full gap-4 px-2">
            <div className="flex flex-col items-center justify-center">
              <div className="flex min-w-[40%] flex-col items-stretch">
                <Card>
                  <CardHeader>Create New User</CardHeader>
                  <div className="grid grid-cols-3 gap-6 px-2 py-6 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Access Level</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect {...getNameProp('accessLevel')}>
                        {accessLevels.map((accessLevel) => (
                          <option key={accessLevel} value={accessLevel}>
                            {accessLevel}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Username</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField {...getNameProp('username')} />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Password</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...getNameProp('password')}
                        type="password"
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Re-enter Password</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...getNameProp('reEnteredPassword')}
                        type="password"
                      />
                    </div>
                  </div>
                </Card>
                <div className="flex flex-col items-stretch justify-center py-4">
                  <PrimaryButton type="submit" disabled={isProcessing}>
                    {isProcessing ? 'Creating New User...' : 'Submit'}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </CenteredView>
        </ActionContextProvider>
      </Form>
      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}

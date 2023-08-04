import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { UpdateEventDetails } from '~/models/events';

import { Response, json, redirect } from '@remix-run/node';
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
} from '@remix-run/react';
import { useMemo } from 'react';
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
import {
  StatusCode,
  badRequest,
  getValidatedId,
  processBadRequest,
} from '~/models/core.validations';
import { getErrorMessage } from '~/models/errors';
import { EventKind } from '~/models/events';
import {
  fieldErrorsToArr,
  getFieldErrors,
  getRawFormFields,
  hasFields,
  hasFormError,
} from '~/models/forms';
import { AppLinks } from '~/models/links';
import { customLog } from '~/models/logger';
import { logActionData, logParseError } from '~/models/logger.server';
import {
  ChangePasswordSchema,
  AccessLevelSchema,
  INVALID_ACCESS_LEVEL_ERR_MESSAGE,
  accessLevels,
  getValidatedAccessLevel,
} from '~/models/user.validations';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);

  const id = getValidatedId(params.id);

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, accessLevel: true, username: true },
  });
  if (!user) {
    throw new Response('User record not found', {
      status: StatusCode.NotFound,
    });
  }

  const accessLevel = getValidatedAccessLevel(user.accessLevel);
  if (!accessLevel) {
    throw new Response(INVALID_ACCESS_LEVEL_ERR_MESSAGE, {
      status: StatusCode.BadRequest,
    });
  }

  return json({ user: { ...user, accessLevel } });
}

const Schema = z.object({
  accessLevel: AccessLevelSchema,
  username: z
    .string()
    .min(1, 'Enter the username')
    .max(50, 'Use less than 50 characters for the username'),
});

export const action = async ({ request, params }: ActionArgs) => {
  const currentUserId = await requireUserId(request);

  try {
    const id = getValidatedId(params.id);

    const fields = await getRawFormFields(request);
    const result = Schema.safeParse(fields);
    if (!result.success) {
      logParseError(request, result.error, fields);
      return processBadRequest(result.error, fields);
    }
    const { accessLevel, username } = result.data;
    logActionData(request, result.data);

    const numDuplicates = await prisma.user.count({
      where: { username, id: { not: id } },
    });
    if (numDuplicates) {
      customLog(
        'info',
        'Attempted to use existing username when updating user',
        { username }
      );
      return badRequest({
        fieldErrors: {
          username: ['A user with that username already exists'],
        },
      });
    }

    await prisma.$transaction(async (tx) => {
      const oldRecord = await tx.user.findUnique({
        where: { id },
      });
      if (!oldRecord) {
        throw new Error('Record not found');
      }
      await tx.user.update({
        where: { id },
        data: { accessLevel, username },
      });
      const details: UpdateEventDetails = {
        accessLevel: { from: oldRecord.accessLevel, to: accessLevel },
        username: { from: oldRecord.username, to: username },
      };
      await tx.userEvent.create({
        data: {
          recordId: id,
          userId: currentUserId,
          details: JSON.stringify(details),
          kind: EventKind.Update,
        },
      });
    });
    customLog('info', 'User updated', { id, accessLevel, username });

    return redirect(AppLinks.Users);
  } catch (error) {
    const formError =
      getErrorMessage(error) ||
      'Something went wrong updating user, please try again';
    return badRequest({ formError });
  }
};

type SchemaKeys = keyof z.infer<typeof Schema>;

export default function EditUserPage() {
  const currentUser = useUser();
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const changePasswordFetcher = useFetcher();

  const updateDetailsFormProps = useForm(actionData, Schema);
  const changePasswordFormProps = useForm(
    changePasswordFetcher.data,
    ChangePasswordSchema
  );

  const defaultValues: Record<SchemaKeys, string> = {
    accessLevel: user.accessLevel,
    username: user.username,
  };

  const updateDetailsFieldErrors = useMemo(
    () => getFieldErrors(actionData),
    [actionData]
  );

  const changePasswordFieldErrors = useMemo(
    () => getFieldErrors(changePasswordFetcher.data),
    [changePasswordFetcher.data]
  );

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={currentUser.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <CenteredView className="w-full gap-4 px-2">
          <div className="flex flex-col items-start justify-center pt-6">
            <span className="text-lg font-semibold">
              Edit {user.username}'s Record
            </span>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <Form method="post" className="flex flex-col items-stretch gap-4">
              <ActionContextProvider
                {...actionData}
                fields={
                  hasFields(actionData) ? actionData.fields : defaultValues
                }
                isSubmitting={updateDetailsFormProps.isProcessing}
              >
                <Card>
                  <CardHeader>User Details</CardHeader>
                  <div className="grid grid-cols-3 gap-6 px-2 py-6 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Access Level</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect
                        {...updateDetailsFormProps.getNameProp('accessLevel')}
                      >
                        {accessLevels.map((accessLevel) => (
                          <option key={accessLevel} value={accessLevel}>
                            {accessLevel}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="flex flex-col items-stretch justify-center p-2">
                      <span>Username</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...updateDetailsFormProps.getNameProp('username')}
                      />
                    </div>
                  </div>
                  <div className="flex flex-row items-start gap-4">
                    {hasFormError(actionData) && (
                      <InlineAlert>{actionData.formError}</InlineAlert>
                    )}
                    {!!updateDetailsFieldErrors && (
                      <InlineAlert>
                        {fieldErrorsToArr(updateDetailsFieldErrors)}
                      </InlineAlert>
                    )}
                  </div>
                </Card>
                <PrimaryButton
                  type="submit"
                  disabled={updateDetailsFormProps.isProcessing}
                >
                  {updateDetailsFormProps.isProcessing
                    ? 'Updating...'
                    : 'Update'}
                </PrimaryButton>
              </ActionContextProvider>
            </Form>
            <changePasswordFetcher.Form
              method="post"
              action={AppLinks.ChangePassword}
              className="flex flex-col items-stretch gap-4"
            >
              <input type="hidden" name="id" value={user.id} />
              <Card>
                <CardHeader>Change Password</CardHeader>
                <div className="grid grid-cols-3 gap-6 px-2 py-6 font-light">
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Password</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField
                      {...changePasswordFormProps.getNameProp('password')}
                      type="password"
                    />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Re-enter Password</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField
                      {...changePasswordFormProps.getNameProp(
                        'reEnteredPassword'
                      )}
                      type="password"
                    />
                  </div>
                </div>
                <div className="flex flex-row items-start gap-4">
                  {hasFormError(changePasswordFetcher.data) && (
                    <InlineAlert>
                      {changePasswordFetcher.data.formError}
                    </InlineAlert>
                  )}
                  {!!changePasswordFieldErrors && (
                    <InlineAlert>
                      {fieldErrorsToArr(changePasswordFieldErrors)}
                    </InlineAlert>
                  )}
                </div>
              </Card>
              <PrimaryButton
                type="submit"
                disabled={changePasswordFormProps.isProcessing}
              >
                {changePasswordFormProps.isProcessing
                  ? 'Changing Password...'
                  : 'Change Password'}
              </PrimaryButton>
            </changePasswordFetcher.Form>
          </div>
        </CenteredView>
      </div>
      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}

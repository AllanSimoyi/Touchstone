import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { ChangeOwnPasswordSchema } from '~/models/user.validations';

import { json } from '@remix-run/node';
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
import { badRequest, processBadRequest } from '~/models/core.validations';
import { getErrorMessage } from '~/models/errors';
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
import { AccessLevelSchema, accessLevels } from '~/models/user.validations';
import {
  createUserSession,
  requireUser,
  requireUserId,
} from '~/session.server';

export async function loader({ request }: LoaderArgs) {
  const currentUser = await requireUser(request);
  return json({ currentUser });
}

const Schema = z.object({
  accessLevel: AccessLevelSchema,
  username: z
    .string()
    .min(1, 'Enter your username')
    .max(50, 'Use less than 50 characters for your username'),
});

export const action = async ({ request }: ActionArgs) => {
  const currentUserId = await requireUserId(request);

  try {
    const fields = await getRawFormFields(request);
    const result = Schema.safeParse(fields);
    if (!result.success) {
      logParseError(request, result.error, fields);
      return processBadRequest(result.error, fields);
    }
    const { accessLevel, username } = result.data;
    logActionData(request, result.data);

    const numDuplicates = await prisma.user.count({
      where: { username, id: { not: currentUserId } },
    });
    if (numDuplicates) {
      customLog(
        'info',
        'Attempted to use existing username when updating current user',
        { username }
      );
      return badRequest({
        fieldErrors: {
          username: ['A user with that username already exists'],
        },
      });
    }

    await prisma.user.update({
      where: { id: currentUserId },
      data: { accessLevel, username },
    });
    customLog('info', 'Current user updated', {
      currentUserId,
      accessLevel,
      username,
    });

    return createUserSession({
      request,
      userId: currentUserId,
      remember: true,
      redirectTo: AppLinks.Customers,
    });
  } catch (error) {
    const formError =
      getErrorMessage(error) ||
      'Something went wrong updating your user record, please try again';
    return badRequest({ formError });
  }
};

type SchemaKeys = keyof z.infer<typeof Schema>;

export default function MyAccountPage() {
  const { currentUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const changePasswordFetcher = useFetcher();

  const updateDetailsFormProps = useForm<SchemaKeys>(actionData);
  const changePasswordFormProps = useForm<
    keyof z.infer<typeof ChangeOwnPasswordSchema>
  >(changePasswordFetcher.data);

  const defaultValues: Record<SchemaKeys, string> = {
    accessLevel: currentUser.accessLevel,
    username: currentUser.username,
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
      <CenteredView className="w-full gap-4 px-2">
        <div className="flex flex-col items-start justify-center pt-6">
          <span className="text-base font-semibold">My Account</span>
        </div>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <Form method="post" className="flex flex-col items-stretch gap-4">
            <ActionContextProvider
              {...actionData}
              fields={hasFields(actionData) ? actionData.fields : defaultValues}
              isSubmitting={updateDetailsFormProps.isProcessing}
            >
              <Card>
                <CardHeader>User Details</CardHeader>
                <div className="flex flex-col items-stretch gap-2 p-2">
                  <FormSelect
                    {...updateDetailsFormProps.getNameProp('accessLevel')}
                    label="Access Level"
                  >
                    {accessLevels.map((accessLevel) => (
                      <option key={accessLevel} value={accessLevel}>
                        {accessLevel}
                      </option>
                    ))}
                  </FormSelect>
                  <FormTextField
                    {...updateDetailsFormProps.getNameProp('username')}
                    label="Username"
                  />
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
                {updateDetailsFormProps.isProcessing ? 'Updating...' : 'Update'}
              </PrimaryButton>
            </ActionContextProvider>
          </Form>
          <changePasswordFetcher.Form
            method="post"
            action={AppLinks.ChangeOwnPassword}
            className="flex flex-col items-stretch gap-4"
          >
            <input type="hidden" name="id" value={currentUser.id} />
            <ActionContextProvider
              {...changePasswordFetcher.data}
              fields={
                hasFields(changePasswordFetcher.data)
                  ? changePasswordFetcher.data.fields
                  : {}
              }
              isSubmitting={changePasswordFormProps.isProcessing}
            >
              <Card>
                <CardHeader>Change Password</CardHeader>
                <div className="flex flex-col items-stretch gap-2 p-2">
                  <FormTextField
                    {...changePasswordFormProps.getNameProp('currentPassword')}
                    type="password"
                    label="Your Current Password"
                  />
                  <FormTextField
                    {...changePasswordFormProps.getNameProp('newPassword')}
                    type="password"
                    label="Your New Password"
                  />
                  <FormTextField
                    {...changePasswordFormProps.getNameProp(
                      'reEnteredPassword'
                    )}
                    type="password"
                    label="Re-enter Your New Password"
                  />
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
            </ActionContextProvider>
          </changePasswordFetcher.Form>
        </div>
      </CenteredView>
      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}

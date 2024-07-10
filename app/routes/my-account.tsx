import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { RefObject } from 'react';

import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  ActionContextProvider,
  useForm,
} from '~/components/ActionContextProvider';
import { RouteErrorBoundary } from '~/components/Boundaries';
import { Breadcrumb } from '~/components/Breadcrumb';
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
  badRequest,
  hasSuccess,
  processBadRequest,
} from '~/models/core.validations';
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
import {
  AccessLevelSchema,
  ChangeOwnPasswordSchema,
  accessLevels,
} from '~/models/user.validations';
import { requireUser, requireUserId } from '~/session.server';

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

    return json({ success: true });
    // return createUserSession({
    //   request,
    //   userId: currentUserId,
    //   remember: true,
    //   redirectTo: AppLinks.Customers,
    // });
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
  const fetcher = useFetcher<typeof action>();
  const changePasswordFetcher = useFetcher();

  const updateDetailsFormProps = useForm(fetcher.data, Schema);
  const changePasswordFormProps = useForm(
    changePasswordFetcher.data,
    ChangeOwnPasswordSchema
  );

  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const reEnteredPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasSuccess(fetcher.data)) {
      toast.success('Your details have been updated', { duration: 5_000 });
    }
  }, [fetcher.data]);

  const clearRef = (ref: RefObject<HTMLInputElement>) => {
    if (ref.current) {
      ref.current.value = '';
    }
  };

  useEffect(() => {
    if (hasSuccess(changePasswordFetcher.data)) {
      toast.success('Your password has been changed', { duration: 5_000 });
      clearRef(currentPasswordRef);
      clearRef(newPasswordRef);
      clearRef(reEnteredPasswordRef);
    }
  }, [changePasswordFetcher.data]);

  const defaultValues: Record<SchemaKeys, string> = {
    accessLevel: currentUser.accessLevel,
    username: currentUser.username,
  };

  const updateDetailsFieldErrors = useMemo(
    () => getFieldErrors(fetcher.data),
    [fetcher.data]
  );

  const changePasswordFieldErrors = useMemo(
    () => getFieldErrors(changePasswordFetcher.data),
    [changePasswordFetcher.data]
  );

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={currentUser.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <CenteredView className="w-full grow gap-4 px-2">
          <div className="flex flex-col items-stretch py-4">
            <Breadcrumb items={[[AppLinks.Home, 'Home'], 'My Account']} />
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <fetcher.Form
              method="post"
              className="flex flex-col items-stretch gap-4"
            >
              <ActionContextProvider
                {...fetcher.data}
                fields={
                  hasFields(fetcher.data) ? fetcher.data.fields : defaultValues
                }
                isSubmitting={updateDetailsFormProps.isProcessing}
              >
                <Card className="grow">
                  <CardHeader>User Details</CardHeader>
                  <div className="grid grid-cols-3 gap-6 px-2 py-6 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Access Level</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect
                        isRow={false}
                        {...updateDetailsFormProps.getNameProp('accessLevel')}
                      >
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
                      <FormTextField
                        {...updateDetailsFormProps.getNameProp('username')}
                      />
                    </div>
                  </div>
                  <div className="flex flex-row items-start gap-4">
                    {hasFormError(fetcher.data) && (
                      <InlineAlert>{fetcher.data.formError}</InlineAlert>
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
            </fetcher.Form>
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
                  <div className="grid grid-cols-3 gap-4 px-2 py-2 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Your Current Password</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...changePasswordFormProps.getNameProp(
                          'currentPassword'
                        )}
                        customRef={currentPasswordRef}
                        type="password"
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Your New Password</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...changePasswordFormProps.getNameProp('newPassword')}
                        customRef={newPasswordRef}
                        type="password"
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Re-enter Your New Password</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...changePasswordFormProps.getNameProp(
                          'reEnteredPassword'
                        )}
                        customRef={reEnteredPasswordRef}
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
              </ActionContextProvider>
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

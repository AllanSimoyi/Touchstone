import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node';

import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react';
import { z } from 'zod';

import { ActionContextProvider } from '~/components/ActionContextProvider';
import { RouteErrorBoundary } from '~/components/Boundaries';
import { Footer } from '~/components/Footer';
import { FormTextField } from '~/components/FormTextField';
import { InlineAlert } from '~/components/InlineAlert';
import { Logo } from '~/components/Logo';
import { PrimaryButton } from '~/components/PrimaryButton';
import { badRequest, processBadRequest } from '~/models/core.validations';
import { getRawFormFields, hasFormError } from '~/models/forms';
import { verifyLogin } from '~/models/user.server';
import { createUserSession } from '~/session.server';
import { safeRedirect } from '~/utils';

export const loader = async ({ request }: LoaderArgs) => {
  // const userId = await getUserId(request);
  // if (userId) return redirect('/');
  return json({});
};

const Schema = z.object({
  username: z
    .string()
    .min(1, 'Please enter your username')
    .max(50, 'Please use less than 50 characters for your username'),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .max(50, 'Please use less than 50 characters for your password'),
});
export const action = async ({ request }: ActionArgs) => {
  const fields = await getRawFormFields(request);
  const result = Schema.safeParse(fields);
  if (!result.success) {
    return processBadRequest(result.error, fields);
  }
  const { username, password } = result.data;

  const user = await verifyLogin(username, password);
  if (!user) {
    return badRequest({ fields, formError: `Incorrect credentials` });
  }

  const redirectTo = safeRedirect(fields.redirectTo, '/');
  return createUserSession({
    request,
    userId: user.id,
    remember: true,
    redirectTo,
  });
};

export const meta: V2_MetaFunction = () => [{ title: 'Login' }];

export default function LoginPage() {
  useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const navigation = useNavigation();

  const isProcessing = navigation.state !== 'idle';

  return (
    <div className="flex h-full flex-col items-stretch justify-center">
      <div className="flex h-full flex-col items-center justify-center gap-8 p-2">
        <div className="grow" />
        <Logo />
        <Form
          method="post"
          className="flex w-full flex-col items-stretch justify-center gap-12 bg-white p-4 shadow-md sm:w-[80%] md:w-[60%] lg:w-[30%]"
        >
          <ActionContextProvider {...actionData} isSubmitting={isProcessing}>
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-xl font-semibold">Login to continue</h1>
            </div>
            <div className="flex flex-col items-stretch gap-4">
              <FormTextField name="username" label="Username" />
              <FormTextField name="password" label="Password" type="password" />
              {hasFormError(actionData) && (
                <InlineAlert>{actionData.formError}</InlineAlert>
              )}
            </div>
            <div className="flex flex-col items-stretch">
              <PrimaryButton type="submit" disabled={isProcessing}>
                {isProcessing ? 'Logging In...' : 'Log In'}
              </PrimaryButton>
            </div>
          </ActionContextProvider>
        </Form>
        <div className="grow" />
      </div>
      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}

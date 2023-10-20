import type { ActionArgs, V2_MetaFunction } from '@remix-run/node';

import { json } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';

import { ActionContextProvider } from '~/components/ActionContextProvider';
import { RouteErrorBoundary } from '~/components/Boundaries';
import { Footer } from '~/components/Footer';
import { FormTextField } from '~/components/FormTextField';
import { InlineAlert } from '~/components/InlineAlert';
import { Logo } from '~/components/Logo';
import { PrimaryButton } from '~/components/PrimaryButton';
import { hasFormError } from '~/models/forms';

export const action = async ({ request }: ActionArgs) => {
  return json({ success: true });
};

// INSERT INTO areas (id, identifier, "createdAt", "updatedAt") VALUES (130, 'MAT', '2021-02-12 13:54:24.867', '2021-02-12 13:54:24.867');

export const meta: V2_MetaFunction = () => [{ title: 'Login' }];

export default function LoginPage() {
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
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { z } from "zod";
import { ActionContextProvider } from "~/components/ActionContextProvider";
import { AppTitle } from "~/components/AppTitle";
import { Footer } from "~/components/Footer";
import { FormTextField } from "~/components/FormTextField";
import { InlineAlert } from "~/components/InlineAlert";
import { PrimaryButton } from "~/components/PrimaryButton";
import { badRequest, processBadRequest } from "~/models/core.validations";
import { getRawFormFields, hasFormError } from "~/models/forms";
import { AppLinks } from "~/models/links";

import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

const Schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
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

export const meta: V2_MetaFunction = () => [{ title: "Login" }];

export default function LoginPage() {
  useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const navigation = useNavigation();

  const isProcessing = navigation.state !== 'idle';

  return (
    <div className="flex h-full flex-col items-stretch justify-center">
      <div className="flex h-full flex-col items-center justify-center">
        <div className="grow" />
        <Form
          method="post"
          className="flex w-full flex-col items-stretch justify-center gap-12 p-4 sm:w-[80%] md:w-[60%] lg:w-[40%]"
        >
          <ActionContextProvider {...actionData} isSubmitting={isProcessing}>
            <div className="flex flex-col items-center justify-center">
              <Link to={AppLinks.Home}>
                <AppTitle />
              </Link>
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

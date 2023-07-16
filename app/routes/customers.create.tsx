import type { LoaderArgs, type ActionArgs } from '@remix-run/node';

import { json } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { z } from 'zod';

import { Accordion } from '~/components/Accordion';
import { AccordionItem } from '~/components/AccordionItem';
import { ActionContextProvider } from '~/components/ActionContextProvider';
import { Card } from '~/components/Card';
import { CenteredView } from '~/components/CenteredView';
import { Footer } from '~/components/Footer';
import { FormSelect } from '~/components/FormSelect';
import { FormTextField } from '~/components/FormTextField';
import { Toolbar } from '~/components/Toolbar';
import { processBadRequest } from '~/models/core.validations';
import { getRawFormFields } from '~/models/forms';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export async function loader({ request }: LoaderArgs) {
  const;
}

const Schema = z.object({});
export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const fields = await getRawFormFields(request);
  const result = Schema.safeParse(fields);
  if (!result.success) {
    return processBadRequest(result.error, fields);
  }
  return json({});
};

export default function CreateCustomerPage() {
  const user = useUser();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isProcessing = navigation.state !== 'idle';

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <Form method="post" className="flex grow flex-col items-stretch py-12">
        <ActionContextProvider {...actionData} isSubmitting={isProcessing}>
          <CenteredView className="gap-6 px-2">
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-lg font-semibold">Record New Customer</span>
            </div>
            <Card>
              <AccordionItem header="Identification Details">
                <div className="flex flex-col items-stretch gap-2 py-2">
                  <FormTextField name="companyName" label="Company Name" />
                  <FormTextField name="accountNumber" label="Account #" />
                  <FormTextField name="tradingAs" label="Trading As" />
                  <FormTextField name="formerly" label="Formerly" />
                </div>
              </AccordionItem>
            </Card>
            <Card>
              <AccordionItem header="CEO Details">
                <div className="flex flex-col items-stretch gap-2 py-2">
                  <FormTextField name="ceoName" label="CEO's Name" />
                  <FormTextField name="ceoEmail" label="CEO's Email" />
                  <FormTextField name="ceoPhone" label="CEO's Phone #" />
                  <FormTextField name="ceoFax" label="CEO's Fax #" />
                </div>
              </AccordionItem>
            </Card>
            <Card>
              <AccordionItem header="Contact Details">
                <div className="flex flex-col items-stretch gap-2 py-2">
                  <FormTextField name="addr" label="Physical Address" />
                  <FormTextField name="tel" label="Telephone Number" />
                  <FormTextField name="fsx" label="Fax Number" />
                  <FormTextField name="cell" label="Cellphone Number" />
                </div>
              </AccordionItem>
            </Card>
            <Card>
              <AccordionItem header="License Details">
                <div className="flex flex-col items-stretch gap-2 py-2">
                  <FormSelect name="licenseId" label="License">
                    {licenseOptions}
                  </FormSelect>
                  <FormTextField name="addr" label="Physical Address" />
                  <FormTextField name="tel" label="Telephone Number" />
                  <FormTextField name="fsx" label="Fax Number" />
                  <FormTextField name="cell" label="Cellphone Number" />
                </div>
              </AccordionItem>
            </Card>
          </CenteredView>
        </ActionContextProvider>
      </Form>
      <Footer />
    </div>
  );
}

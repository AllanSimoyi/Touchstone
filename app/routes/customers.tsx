import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/Card";
import { CenteredView } from "~/components/CenteredView";
import { DebouncedSearch } from "~/components/DebouncedSearch";
import { Footer } from "~/components/Footer";
import { FormSelect } from "~/components/FormSelect";
import { PrimaryButtonLink } from "~/components/PrimaryButton";
import { Toolbar } from "~/components/Toolbar";
import { prisma } from "~/db.server";
import { AppLinks } from "~/models/links";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);

  const customers = await prisma.account.findMany({
    select: {
      id: true,
      accountNumber: true,
      companyName: true,
      license: {
        select: { identifier: true, },
      },
    }
  });

  return json({ customers });
};

export default function CustomersPage() {
  const user = useUser();
  const { customers } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <div className="flex grow flex-col items-stretch py-12">
        <CenteredView className="px-2 gap-6">
          <Card className="flex flex-row divide-x items-stretch">
            <div className="flex flex-col justify-center items-center p-2">
              <FormSelect name="layout" label="Username" />
            </div>
            <div className="flex flex-col justify-center items-center p-2">
              <FormSelect name="filterByArea" label="Username" />
            </div>
            <div className="flex flex-col justify-center items-center p-2">
              <FormSelect name="sortBy" label="Username" />
            </div>
            <div className="flex flex-col justify-center items-center p-2">
              <FormSelect name="sortOrder" label="Username" />
            </div>
            <div className="flex flex-col justify-center items-center p-2">
              <DebouncedSearch runSearch={() => { }} placeholder="Search" />
            </div>
            <div className="flex flex-col justify-center items-center p-2">
              <PrimaryButtonLink to={AppLinks.AddCustomer}>
                New Customer
              </PrimaryButtonLink>
            </div>
          </Card>
          <Card>
            <div className="flex flex-col justify-center items-center p-2 border-b border-zinc-100">
              <h2 className="text-lg font-semibold">Customers</h2>
            </div>
            <div className="flex flex-col justify-center items-center p-2">
              <table>
                <thead>
                  <tr>
                    <th>
                      <span className="text-sm font-semibold">Acc#</span>
                    </th>
                    <th>
                      <span className="text-sm font-semibold">Company</span>
                    </th>
                    <th>
                      <span className="text-sm font-semibold">License</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id}>
                      <td>
                        <span className="text-base font-light">{customer.accountNumber}</span>
                      </td>
                      <td>
                        <span className="text-base font-light">{customer.companyName}</span>
                      </td>
                      <td>
                        <span className="text-base font-light">{customer.license.identifier}</span>
                      </td>
                    </tr>
                  ))}
                  {!customers.length && (
                    <tr>
                      <td colSpan={3} className="flex flex-col justify-center items-center">
                        <span className="text-base font-light text-zinc-400">No customers found</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </CenteredView>
      </div>
      <Footer />
    </div>
  );
}

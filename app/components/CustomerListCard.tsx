import type { ComponentProps } from 'react';

import { AppLinks } from '~/models/links';

import { Card } from './Card';
import { CustomerTableRow } from './CustomerTableRow';
import { PrimaryButtonLink } from './PrimaryButton';

interface Props {
  title: string;
  customers: ComponentProps<typeof CustomerTableRow>[];
}
export function CustomerListCard(props: Props) {
  const { title, customers } = props;

  return (
    <Card>
      <div className="flex flex-row items-center justify-start border-b border-b-zinc-200 px-4 py-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="grow" />
        <PrimaryButtonLink to={AppLinks.AddCustomer}>
          New Customer
        </PrimaryButtonLink>
      </div>
      <div className="flex flex-col items-stretch justify-center p-2">
        {!!customers.length && (
          <table className="table-auto border-collapse text-left">
            <thead className="divide-y">
              <tr className="border-b border-b-zinc-100">
                <th className="p-2">
                  <span className="text-sm font-semibold">Account #</span>
                </th>
                <th className="p-2">
                  <span className="text-sm font-semibold">Company</span>
                </th>
                <th className="p-2">
                  <span className="text-sm font-semibold">Accountant</span>
                </th>
                <th className="p-2">
                  <span className="text-sm font-semibold">License</span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {customers.map((customer) => (
                <CustomerTableRow key={customer.id} {...customer} />
              ))}
            </tbody>
          </table>
        )}
        {!customers.length && (
          <div className="flex flex-col items-center justify-center px-2 py-6">
            <span className="text-sm font-light text-zinc-400">
              No customers found
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

import { Link, useFetcher } from '@remix-run/react';
import { twMerge } from 'tailwind-merge';

import { useDelete } from '~/hooks/useDelete';
import { AppLinks } from '~/models/links';

import { ConfirmDelete } from './ConfirmDelete';
import { CustomerTableDropDownMenu } from './CustomerTableDropDownMenu';

interface Props {
  id: number;
  accountNumber: string;
  companyName: string;
  license: { identifier: string };
  accountant?: { name: string; email: string } | undefined;
}
export function CustomerTableRow(props: Props) {
  const { id, accountNumber, companyName, license, accountant } = props;
  const { submit, state } = useFetcher();

  const { isOpen, askForConfirmation, closeModal, onConfirmed } = useDelete({
    handleDelete: () => {
      return submit(
        { id },
        { action: AppLinks.DeleteCustomer, method: 'post' }
      );
    },
  });

  const isDeleting = state !== 'idle';

  return (
    <>
      <ConfirmDelete
        isOpen={isOpen}
        onConfirmed={onConfirmed}
        closeModal={closeModal}
      />
      <tr
        key={id}
        className={twMerge(
          'border-t border-t-zinc-100',
          isDeleting && 'bg-zinc-50'
        )}
      >
        <td className="p-2">
          <span className="font-light text-zinc-600">{accountNumber}</span>
        </td>
        <td className="p-2">
          <Link
            to={AppLinks.Customer(id)}
            className="font-semibold text-zinc-600 hover:underline"
          >
            {companyName}
          </Link>
        </td>
        <td className="p-2">
          <span className="font-light text-zinc-600">
            {accountant
              ? [accountant.name, accountant.email].filter(Boolean).join(' - ')
              : '-'}
          </span>
        </td>
        <td className="p-2">
          <span className="font-light text-zinc-600">{license.identifier}</span>
        </td>
        <td className="flex flex-col items-end p-2">
          {!isDeleting && (
            <CustomerTableDropDownMenu
              customerId={id}
              handleDelete={askForConfirmation}
            />
          )}
        </td>
      </tr>
    </>
  );
}

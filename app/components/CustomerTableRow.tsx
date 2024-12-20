import type { z } from 'zod';
import type { DeleteRecordSchema } from '~/models/core.validations';

import { Link, useFetcher } from '@remix-run/react';
import { twMerge } from 'tailwind-merge';

import { useDelete } from '~/hooks/useDelete';
import { AppLinks } from '~/models/links';

import { ConfirmDelete } from './ConfirmDelete';
import { HighlightText } from './HighlightText';
import { TableDropDownMenu } from './TableDropDownMenu';
import { UnderLineOnHover } from './UnderLineOnHover';

interface Props {
  id: number;
  accountNumber: string;
  companyName: string;
  accountantName: string;
  accountantEmail: string;
  license: { identifier: string } | null;
}
export function CustomerTableRow(props: Props) {
  const {
    id,
    accountNumber,
    companyName,
    license,
    accountantName,
    accountantEmail,
  } = props;
  const { submit, state } = useFetcher();

  const { isOpen, askForConfirmation, closeModal, onConfirmed } = useDelete({
    handleDelete: () => {
      const data: z.infer<typeof DeleteRecordSchema> = {
        id,
        recordType: 'Account',
      };
      return submit(data, { action: AppLinks.DeleteRecord, method: 'post' });
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
          <Link to={AppLinks.Customer(id)}>
            <div className="flex flex-col items-start">
              <UnderLineOnHover>
                <HighlightText className="font-semibold text-zinc-600">
                  {companyName}
                </HighlightText>
              </UnderLineOnHover>
            </div>
          </Link>
        </td>
        <td className="p-2">
          <HighlightText className="font-light text-zinc-600">
            {!!accountantName || !!accountantEmail
              ? [accountantName, accountantEmail].filter(Boolean).join(' - ')
              : '-'}
          </HighlightText>
        </td>
        <td className="p-2">
          <HighlightText className="font-light text-zinc-600">
            {license?.identifier || '-'}
          </HighlightText>
        </td>
        <td className="flex flex-col items-end p-2">
          {!isDeleting && (
            <TableDropDownMenu
              actionItem={AppLinks.EditCustomer(id)}
              identifier="Customer"
              handleDelete={askForConfirmation}
            />
          )}
        </td>
      </tr>
    </>
  );
}

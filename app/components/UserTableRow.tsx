import type { z } from 'zod';
import type { DeleteRecordSchema } from '~/models/core.validations';
import type { AccessLevel } from '~/models/user.validations';

import { useFetcher } from '@remix-run/react';
import { twMerge } from 'tailwind-merge';

import { useDelete } from '~/hooks/useDelete';
import { AppLinks } from '~/models/links';

import { ConfirmDelete } from './ConfirmDelete';
import { TableDropDownMenu } from './TableDropDownMenu';

interface Props {
  id: number;
  accessLevel: AccessLevel;
  username: string;
}
export function UserTableRow(props: Props) {
  const { id, accessLevel, username } = props;
  const { submit, state } = useFetcher();

  const { isOpen, askForConfirmation, closeModal, onConfirmed } = useDelete({
    handleDelete: () => {
      const data: z.infer<typeof DeleteRecordSchema> = {
        id,
        recordType: 'User',
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
          <span className="font-light text-zinc-600">{accessLevel}</span>
        </td>
        <td className="p-2">
          <span className="font-light text-zinc-600">{username}</span>
        </td>
        <td className="flex flex-col items-end p-2">
          {!isDeleting && (
            <TableDropDownMenu
              identifier="User"
              actionItem={AppLinks.EditUser(id)}
              handleDelete={askForConfirmation}
            />
          )}
        </td>
      </tr>
    </>
  );
}

import type { FetcherWithComponents } from '@remix-run/react';
import type { ComponentProps, FormEvent } from 'react';
import type { RECORD_TYPES } from '~/models/core.validations';

import { X } from 'tabler-icons-react';

import { AppLinks } from '~/models/links';

import { ActionContextProvider } from './ActionContextProvider';
import { ConfirmDelete } from './ConfirmDelete';
import { GhostButton } from './GhostButton';
import { InputRecordType } from './InputRecordType';

interface Props extends ComponentProps<typeof ConfirmDelete> {
  fetcher: FetcherWithComponents<any>;
  isUpdating?: boolean;
  handleDelete: (event: FormEvent<HTMLFormElement>) => void;
  id: number;
  recordType: (typeof RECORD_TYPES)[number];
}
export function DeletePickListItem(props: Props) {
  const {
    fetcher,
    id,
    recordType,
    isUpdating,
    isOpen,
    onConfirmed,
    closeModal,
    handleDelete,
  } = props;

  return (
    <fetcher.Form
      method="post"
      action={AppLinks.DeleteRecord}
      onSubmit={handleDelete}
      className="flex flex-col items-center justify-center"
    >
      <ActionContextProvider {...fetcher.data} isSubmitting={false}>
        <ConfirmDelete
          isOpen={isOpen}
          onConfirmed={onConfirmed}
          closeModal={closeModal}
        />
        <input type="hidden" name="id" value={id} />
        <InputRecordType value={recordType} />
        <GhostButton
          type="submit"
          className="group p-0"
          title="Remove item"
          disabled={isUpdating}
        >
          <X className="text-red-600 transition-all duration-300 group-hover:rotate-90" />
        </GhostButton>
      </ActionContextProvider>
    </fetcher.Form>
  );
}

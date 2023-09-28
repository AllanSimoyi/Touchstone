import type { FetcherWithComponents } from '@remix-run/react';

import { useEffect, type ComponentProps, type FormEvent } from 'react';
import { toast } from 'sonner';
import { X } from 'tabler-icons-react';

import { hasSuccess, type RECORD_TYPES } from '~/models/core.validations';
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

  useEffect(() => {
    if (hasSuccess(fetcher.data)) {
      toast.success('Pick list item deleted successfully', { duration: 5_000 });
    }
  }, [fetcher.data]);

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
        <GhostButton type="submit" title="Remove item" disabled={isUpdating}>
          <X className="text-red-600 transition-all duration-150" />
        </GhostButton>
      </ActionContextProvider>
    </fetcher.Form>
  );
}

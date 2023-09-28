import type { FormEvent } from 'react';
import type { z } from 'zod';
import type { RECORD_TYPES } from '~/models/core.validations';

import { useFetcher } from '@remix-run/react';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

import { useForm } from '~/components/ActionContextProvider';
import { DeleteRecordSchema, hasSuccess } from '~/models/core.validations';
import { AppLinks } from '~/models/links';

import { useActionErrors } from './useActionErrors';
import { useDelete } from './useDelete';

export function useDeleteRecord(
  id: number,
  recordType: (typeof RECORD_TYPES)[number]
) {
  const deleteFetcher = useFetcher();

  const deleteProps = useForm(deleteFetcher.data, DeleteRecordSchema);

  const deleteErrors = useActionErrors(deleteFetcher.data);

  useEffect(() => {
    if (hasSuccess(deleteFetcher.data)) {
      toast.success('Pick list item deleted successfully', { duration: 5_000 });
    }
  }, [deleteFetcher.data]);

  const { isOpen, askForConfirmation, closeModal, onConfirmed } = useDelete({
    handleDelete: () => {
      const data: z.infer<typeof DeleteRecordSchema> = {
        id,
        recordType,
      };
      return deleteFetcher.submit(data, {
        action: AppLinks.DeleteRecord,
        method: 'post',
      });
    },
  });

  const handleDelete = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      askForConfirmation();
    },
    [askForConfirmation]
  );

  return {
    handleDelete,
    isOpen,
    closeModal,
    onConfirmed,
    deleteErrors,
    deleteProps,
    deleteState: deleteFetcher.state,
    deleteFetcher,
  };
}

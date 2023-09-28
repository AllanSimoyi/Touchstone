import type { ComponentProps, KeyboardEvent, RefObject } from 'react';
import type { RECORD_TYPES } from '~/models/core.validations';

import { useFetcher } from '@remix-run/react';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Plus } from 'tabler-icons-react';
import { twMerge } from 'tailwind-merge';

import { useDeleteRecord } from '~/hooks/useDeleteRecord';
import { useFieldClearOnSuccess } from '~/hooks/useFieldClearOnSuccess';
import { useFormData } from '~/hooks/useFormData';
import { useKeyDown } from '~/hooks/useKeyDown';
import { useUpdateRecord } from '~/hooks/useUpdateRecord';
import {
  AddLicenseDetailSchema,
  UpdateLicenseDetailSchema,
  hasSuccess,
} from '~/models/core.validations';
import { hasFormError } from '~/models/forms';
import { AppLinks } from '~/models/links';

import { ActionContextProvider, useForm } from './ActionContextProvider';
import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { Chip } from './Chip';
import { DeletePickListItem } from './DeletePickListItem';
import { FormTextField } from './FormTextField';
import { InlineAlert } from './InlineAlert';
import { InputRecordType } from './InputRecordType';
import { OptimisticChip } from './OptimisticPickListChip';
import { SecondaryButton } from './SecondaryButton';

interface Props extends ComponentProps<typeof Card> {
  items: { id: number; identifier: string }[];
}
const RecordType: (typeof RECORD_TYPES)[number] = 'LicenseDetail';
export function AddEditLicenseDetails(props: Props) {
  const { items, className, ...restOfProps } = props;
  const identifierRef = useRef<HTMLInputElement>(null);

  const fetcher = useFetcher();
  const { getNameProp, isProcessing } = useForm(
    fetcher.data,
    AddLicenseDetailSchema
  );

  const clearRef = (
    ref: RefObject<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (ref.current) {
      ref.current.value = '';
    }
  };

  useEffect(() => {
    if (hasSuccess(fetcher.data)) {
      clearRef(identifierRef);
      toast.success('License detail added successfully', { duration: 5_000 });
    }
  }, [fetcher.data]);

  const optimisticItem = useFormData(
    fetcher.submission?.formData,
    AddLicenseDetailSchema,
    ['name']
  );
  useFieldClearOnSuccess(fetcher.data, [identifierRef]);

  return (
    <Card
      className={twMerge('flex flex-col items-stretch gap-2', className)}
      {...restOfProps}
    >
      <CardHeader>License Details</CardHeader>
      <div className="flex flex-col items-stretch gap-2 p-2">
        <fetcher.Form
          method="post"
          action={AppLinks.AddRecord}
          className="flex flex-row items-start gap-2"
        >
          <ActionContextProvider {...fetcher.data} isSubmitting={isProcessing}>
            <InputRecordType value={RecordType} />
            <div className="flex grow flex-col items-stretch">
              <FormTextField
                customRef={identifierRef}
                {...getNameProp('name')}
                placeholder="Enter new license detail"
                className="px-4"
              />
            </div>
            <SecondaryButton type="submit" isIcon>
              <Plus className="text-zinc-600" size={20} />
            </SecondaryButton>
          </ActionContextProvider>
        </fetcher.Form>
        {hasFormError(fetcher.data) && (
          <InlineAlert>{fetcher.data.formError}</InlineAlert>
        )}
        {!!optimisticItem?.name && (
          <OptimisticChip>{optimisticItem.name}</OptimisticChip>
        )}
        {items.map((item, index) => (
          <ItemChip key={index} {...item} />
        ))}
      </div>
    </Card>
  );
}

function ItemChip(item: { id: number; identifier: string }) {
  const updateRecordProps = useUpdateRecord(UpdateLicenseDetailSchema);
  const {
    updateFetcher,
    updateErrors,
    isUpdating,
    updateProps: { getNameProp },
  } = updateRecordProps;

  const formRef = useRef<HTMLFormElement>(null);
  const { onEnterPressed } = useKeyDown();

  useEffect(() => {
    if (hasSuccess(updateFetcher.data)) {
      toast.success('License detail updated successfully', { duration: 5_000 });
    }
  }, [updateFetcher.data]);

  const handleUpdateSubmit = useCallback(() => {
    if (formRef.current) {
      updateFetcher.submit(formRef.current);
    }
  }, [updateFetcher]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      onEnterPressed(event, () => handleUpdateSubmit());
    },
    [onEnterPressed, handleUpdateSubmit]
  );

  const deleteRecordProps = useDeleteRecord(item.id, RecordType);
  const { handleDelete, deleteErrors, deleteState, deleteFetcher } =
    deleteRecordProps;

  if (deleteState !== 'idle') {
    return null;
  }

  return (
    <Chip className="flex flex-col items-stretch gap-2">
      <div className="flex flex-row items-center gap-2">
        <updateFetcher.Form
          method="post"
          ref={formRef}
          action={AppLinks.UpdateRecord}
          className="flex grow flex-row items-stretch gap-2"
        >
          <ActionContextProvider
            {...updateFetcher.data}
            isSubmitting={isUpdating}
          >
            <input type="hidden" name="id" value={item.id} />
            <InputRecordType value={RecordType} />
            <div className="flex grow flex-col items-stretch">
              <FormTextField
                camouflage
                key={item.identifier}
                {...getNameProp('name')}
                defaultValue={item.identifier}
                disabled={isUpdating}
                onKeyDown={handleKeyDown}
                className="cursor-pointer"
              />
            </div>
          </ActionContextProvider>
        </updateFetcher.Form>
        <DeletePickListItem
          {...deleteRecordProps}
          id={item.id}
          recordType={RecordType}
          fetcher={deleteFetcher}
          isUpdating={isUpdating}
          handleDelete={handleDelete}
        />
      </div>
      {!!updateErrors && (
        <InlineAlert className="p-2 text-xs">{updateErrors}</InlineAlert>
      )}
      {!!deleteErrors && (
        <InlineAlert className="p-2 text-xs">{deleteErrors}</InlineAlert>
      )}
    </Chip>
  );
}

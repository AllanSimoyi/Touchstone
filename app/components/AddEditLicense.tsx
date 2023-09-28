import type { KeyboardEvent, RefObject } from 'react';
import type { RECORD_TYPES } from '~/models/core.validations';

import { useFetcher } from '@remix-run/react';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Plus } from 'tabler-icons-react';

import { useDeleteRecord } from '~/hooks/useDeleteRecord';
import { useFieldClearOnSuccess } from '~/hooks/useFieldClearOnSuccess';
import { useFormData } from '~/hooks/useFormData';
import { useKeyDown } from '~/hooks/useKeyDown';
import { useUpdateRecord } from '~/hooks/useUpdateRecord';
import {
  AddLicenseSchema,
  UpdateLicenseSchema,
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

interface Props {
  items: { id: number; identifier: string; basicUsd: number }[];
}
const RecordType: (typeof RECORD_TYPES)[number] = 'License';
export function AddEditLicenses(props: Props) {
  const { items } = props;
  const identifierRef = useRef<HTMLInputElement>(null);
  const basicUsdRef = useRef<HTMLInputElement>(null);

  const fetcher = useFetcher();
  const { getNameProp, isProcessing } = useForm(fetcher.data, AddLicenseSchema);

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
      clearRef(basicUsdRef);
      toast.success('License added successfully', { duration: 5_000 });
    }
  }, [fetcher.data]);

  const optimisticItem = useFormData(
    fetcher.submission?.formData,
    AddLicenseSchema,
    ['name', 'basicUsd']
  );
  useFieldClearOnSuccess(fetcher.data, [identifierRef, basicUsdRef]);

  return (
    <Card className="flex flex-col items-stretch gap-2">
      <CardHeader>Licenses</CardHeader>
      <div className="flex flex-col items-stretch gap-2 p-2">
        <fetcher.Form
          method="post"
          action={AppLinks.AddRecord}
          className="flex flex-row items-start gap-2"
        >
          <ActionContextProvider {...fetcher.data} isSubmitting={isProcessing}>
            <InputRecordType value="License" />
            <div className="flex grow flex-row items-stretch gap-2">
              <div className="flex grow flex-col items-stretch">
                <FormTextField
                  customRef={identifierRef}
                  {...getNameProp('name')}
                  placeholder="License"
                  className="px-4"
                />
              </div>
              <div className="flex grow flex-col items-stretch">
                <FormTextField
                  customRef={basicUsdRef}
                  type="number"
                  step=".01"
                  {...getNameProp('basicUsd')}
                  placeholder="Basic USD"
                  className="px-4"
                />
              </div>
            </div>
            <SecondaryButton type="submit" isIcon>
              <Plus className="text-zinc-600" size={20} />
            </SecondaryButton>
          </ActionContextProvider>
        </fetcher.Form>
        {hasFormError(fetcher.data) && (
          <InlineAlert>{fetcher.data.formError}</InlineAlert>
        )}
        <div className="flex max-h-[400px] flex-col items-stretch gap-2 overflow-auto py-2">
          {!!optimisticItem?.name && (
            <OptimisticChip>
              {optimisticItem.name} - USD {optimisticItem.basicUsd || ''}
            </OptimisticChip>
          )}
          {items.map((item, index) => (
            <LicenseChip key={index} {...item} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function LicenseChip(item: {
  id: number;
  identifier: string;
  basicUsd: number;
}) {
  const updateRecordProps = useUpdateRecord(UpdateLicenseSchema);
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
      toast.success('License updated successfully', { duration: 5_000 });
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
            <div className="flex grow flex-row items-stretch gap-1">
              <div className="flex flex-col items-center justify-center peer-hover:bg-white">
                <span className="text-base font-light text-zinc-400">USD</span>
              </div>
              <div className="peer flex grow flex-col items-stretch">
                <FormTextField
                  camouflage
                  key={item.basicUsd}
                  {...getNameProp('basicUsd')}
                  type="number"
                  step=".01"
                  defaultValue={item.basicUsd.toFixed(2)}
                  disabled={isUpdating}
                  onKeyDown={handleKeyDown}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </ActionContextProvider>
        </updateFetcher.Form>
        <DeletePickListItem
          {...deleteRecordProps}
          id={item.id}
          recordType="License"
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

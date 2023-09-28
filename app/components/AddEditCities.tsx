import type { RefObject } from 'react';

import { useFetcher } from '@remix-run/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useDeleteRecord } from '~/hooks/useDeleteRecord';
import { useFieldClearOnSuccess } from '~/hooks/useFieldClearOnSuccess';
import { useFormData } from '~/hooks/useFormData';
import { useUpdateRecord } from '~/hooks/useUpdateRecord';
import {
  AddCitySchema,
  UpdateCitySchema,
  hasSuccess,
} from '~/models/core.validations';

import { AddPickListName } from './AddPickListName';
import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { Chip } from './Chip';
import { DeletePickListItem } from './DeletePickListItem';
import { InlineAlert } from './InlineAlert';
import { OptimisticChip } from './OptimisticPickListChip';
import { UpdatePickListName } from './UpdatePickListName';

interface Props {
  items: { id: number; name: string }[];
}
export function AddEditCities(props: Props) {
  const { items } = props;
  const newCityRef = useRef<HTMLInputElement>(null);

  const addFetcher = useFetcher();

  const clearRef = (
    ref: RefObject<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (ref.current) {
      ref.current.value = '';
    }
  };

  useEffect(() => {
    if (hasSuccess(addFetcher.data)) {
      clearRef(newCityRef);
      toast.success('City added successfully', { duration: 5_000 });
    }
  }, [addFetcher.data]);

  const optimisticItem = useFormData(
    addFetcher.submission?.formData,
    AddCitySchema,
    ['name']
  );
  useFieldClearOnSuccess(addFetcher.data, [newCityRef]);

  return (
    <Card className="flex flex-col items-stretch gap-2">
      <CardHeader>Cities</CardHeader>
      <div className="flex flex-col items-stretch gap-2 p-2">
        <AddPickListName
          fetcher={addFetcher}
          recordType="City"
          customRef={newCityRef}
        />
        <div className="flex max-h-[400px] flex-col items-stretch gap-2 overflow-auto py-2">
          {!!optimisticItem?.name && (
            <OptimisticChip>{optimisticItem.name}</OptimisticChip>
          )}
          {items.map((item, index) => (
            <CityChip key={index} {...item} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function CityChip(item: { id: number; name: string }) {
  const updateRecordProps = useUpdateRecord(UpdateCitySchema);
  const { updateFetcher, updateErrors, isUpdating } = updateRecordProps;

  const deleteRecordProps = useDeleteRecord(item.id, 'City');
  const { handleDelete, deleteErrors, deleteState, deleteFetcher } =
    deleteRecordProps;

  if (deleteState !== 'idle') {
    return null;
  }

  return (
    <Chip className="flex flex-col items-stretch gap-2">
      <div className="flex flex-row items-center gap-2">
        <UpdatePickListName
          fetcher={updateFetcher}
          id={item.id}
          name={item.name}
          recordType="City"
        />
        <DeletePickListItem
          {...deleteRecordProps}
          id={item.id}
          recordType="City"
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

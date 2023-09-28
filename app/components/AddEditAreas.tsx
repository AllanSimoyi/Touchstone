import { useFetcher } from '@remix-run/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useDeleteRecord } from '~/hooks/useDeleteRecord';
import { useFieldClearOnSuccess } from '~/hooks/useFieldClearOnSuccess';
import { useFormData } from '~/hooks/useFormData';
import { useUpdateRecord } from '~/hooks/useUpdateRecord';
import {
  AddAreaSchema,
  UpdateAreaSchema,
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
export function AddEditAreas(props: Props) {
  const { items } = props;
  const newAreaRef = useRef<HTMLInputElement>(null);

  const addFetcher = useFetcher();

  useEffect(() => {
    if (hasSuccess(addFetcher.data)) {
      if (newAreaRef.current) {
        newAreaRef.current.value = '';
      }
      toast.success('Area added successfully', { duration: 5_000 });
    }
  }, [addFetcher.data]);

  const optimisticItem = useFormData(
    addFetcher.submission?.formData,
    AddAreaSchema,
    ['name']
  );
  useFieldClearOnSuccess(addFetcher.data, [newAreaRef]);

  return (
    <Card className="flex flex-col items-stretch gap-2">
      <CardHeader>Areas</CardHeader>
      <div className="flex flex-col items-stretch gap-2 p-2">
        <AddPickListName
          fetcher={addFetcher}
          recordType="Area"
          customRef={newAreaRef}
        />
        <div className="flex max-h-[400px] flex-col items-stretch gap-2 overflow-auto py-2">
          {!!optimisticItem?.name && (
            <OptimisticChip>{optimisticItem.name}</OptimisticChip>
          )}
          {items.map((item, index) => (
            <AreaChip key={index} {...item} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function AreaChip(item: { id: number; name: string }) {
  const updateRecordProps = useUpdateRecord(UpdateAreaSchema);
  const { updateFetcher, updateErrors, isUpdating } = updateRecordProps;

  const deleteRecordProps = useDeleteRecord(item.id, 'Area');
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
          recordType="Area"
        />
        <DeletePickListItem
          {...deleteRecordProps}
          id={item.id}
          recordType="Area"
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

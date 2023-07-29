import { useFetcher } from '@remix-run/react';
import { useRef } from 'react';

import { useDeleteRecord } from '~/hooks/useDeleteRecord';
import { useFieldClearOnSuccess } from '~/hooks/useFieldClearOnSuccess';
import { useFormData } from '~/hooks/useFormData';
import { useUpdateRecord } from '~/hooks/useUpdateRecord';
import { AddSectorSchema, UpdateSectorSchema } from '~/models/core.validations';

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
export function AddEditSectors(props: Props) {
  const { items } = props;
  const newSectorRef = useRef<HTMLInputElement>(null);

  const addFetcher = useFetcher();

  const optimisticItem = useFormData(
    addFetcher.submission?.formData,
    AddSectorSchema,
    ['name']
  );
  useFieldClearOnSuccess(addFetcher.data, AddSectorSchema, [
    ['name', newSectorRef],
  ]);

  return (
    <Card className="flex flex-col items-stretch gap-2">
      <CardHeader>Sectors</CardHeader>
      <div className="flex flex-col items-stretch gap-2 p-2">
        <AddPickListName
          fetcher={addFetcher}
          recordType="Sector"
          customRef={newSectorRef}
        />
        {!!optimisticItem?.name && (
          <OptimisticChip>{optimisticItem.name}</OptimisticChip>
        )}
        {items.map((item, index) => (
          <SectorChip key={index} {...item} />
        ))}
      </div>
    </Card>
  );
}

function SectorChip(item: { id: number; name: string }) {
  const updateRecordProps = useUpdateRecord(UpdateSectorSchema);
  const { updateFetcher, updateErrors, isUpdating } = updateRecordProps;

  const deleteRecordProps = useDeleteRecord(item.id, 'Sector');
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
          recordType="Sector"
        />
        <DeletePickListItem
          {...deleteRecordProps}
          id={item.id}
          recordType="Sector"
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

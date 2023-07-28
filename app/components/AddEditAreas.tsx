import type { z } from 'zod';

import { useFetcher } from '@remix-run/react';
import { useEffect, useMemo, useRef } from 'react';
import { Plus, X } from 'tabler-icons-react';

import {
  hasSuccess,
  type AddAreaSchema,
  type DeleteRecordSchema,
  type UpdateAreaSchema,
} from '~/models/core.validations';
import { fieldErrorsToArr, hasFieldErrors, hasFormError } from '~/models/forms';
import { AppLinks } from '~/models/links';

import { ActionContextProvider, useForm } from './ActionContextProvider';
import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { Chip } from './Chip';
import { FormTextField } from './FormTextField';
import { GhostButton } from './GhostButton';
import { InlineAlert } from './InlineAlert';
import { SecondaryButton } from './SecondaryButton';

interface Props {
  items: { id: number; name: string }[];
}
export function AddEditAreas(props: Props) {
  const { items } = props;
  const newAreaRef = useRef<HTMLInputElement>(null);

  const addFetcher = useFetcher();

  const { getNameProp, isProcessing } = useForm<
    keyof z.infer<typeof AddAreaSchema>
  >(addFetcher.data);

  const optimisticItem = useMemo(() => {
    if (!addFetcher.submission?.formData) {
      return undefined;
    }
    return addFetcher.submission?.formData?.get('name')?.toString();
  }, [addFetcher]);

  useEffect(() => {
    if (hasSuccess(addFetcher.data) && newAreaRef.current) {
      newAreaRef.current.value = '';
    }
  }, [addFetcher.data]);

  return (
    <Card className="flex flex-col items-stretch gap-2">
      <CardHeader>Areas</CardHeader>
      <div className="flex flex-col items-stretch gap-2 p-2">
        <addFetcher.Form
          method="post"
          action={AppLinks.AddRecord}
          className="flex flex-row items-start gap-2"
        >
          <ActionContextProvider
            {...addFetcher.data}
            isSubmitting={isProcessing}
          >
            <input
              type="hidden"
              {...getNameProp('recordType')}
              value={'Area'}
            />
            <div className="flex grow flex-col items-stretch">
              <FormTextField
                customRef={newAreaRef}
                {...getNameProp('name')}
                placeholder="Enter new area"
                className="px-4"
              />
            </div>
            <SecondaryButton type="submit" isIcon>
              <Plus className="text-zinc-600" />
            </SecondaryButton>
          </ActionContextProvider>
        </addFetcher.Form>
        {hasFormError(addFetcher.data) && (
          <InlineAlert>{addFetcher.data.formError}</InlineAlert>
        )}
        {!!optimisticItem && <OptimisticChip name={optimisticItem} />}
        {items.map((item, index) => (
          <AreaChip key={index} {...item} />
        ))}
      </div>
    </Card>
  );
}

function OptimisticChip({ name }: { name: string }) {
  return (
    <Chip className="p-4">
      <span className="text-sm font-light text-zinc-400">{name}</span>
    </Chip>
  );
}

function AreaChip(item: { id: number; name: string }) {
  const updateFetcher = useFetcher();
  const deleteFetcher = useFetcher();

  const updateProps = useForm<keyof z.infer<typeof UpdateAreaSchema>>(
    updateFetcher.data
  );
  const deleteProps = useForm<keyof z.infer<typeof DeleteRecordSchema>>(
    deleteFetcher.data
  );

  const isUpdating = updateFetcher.state !== 'idle';

  const updateErrors = useMemo(() => {
    const fieldErrors = hasFieldErrors(updateFetcher.data)
      ? fieldErrorsToArr(updateFetcher.data.fieldErrors)?.join(', ')
      : undefined;
    const formErrors = hasFormError(updateFetcher.data)
      ? updateFetcher.data.formError
      : undefined;
    return [fieldErrors, formErrors].filter(Boolean).join(', ');
  }, [updateFetcher.data]);

  const deleteErrors = useMemo(() => {
    const fieldErrors = hasFieldErrors(deleteFetcher.data)
      ? fieldErrorsToArr(deleteFetcher.data.fieldErrors)?.join(', ')
      : undefined;
    const formErrors = hasFormError(deleteFetcher.data)
      ? deleteFetcher.data.formError
      : undefined;
    return [fieldErrors, formErrors].filter(Boolean).join(', ');
  }, [deleteFetcher.data]);

  if (deleteFetcher.state !== 'idle') {
    return null;
  }

  return (
    <Chip className="flex flex-col items-stretch gap-2">
      <div className="flex flex-row items-center gap-2">
        <updateFetcher.Form
          method="post"
          action={AppLinks.UpdateRecord}
          className="grow"
        >
          <ActionContextProvider
            {...updateFetcher.data}
            isSubmitting={updateProps.isProcessing}
          >
            <input
              type="hidden"
              {...updateProps.getNameProp('id')}
              value={item.id}
            />
            <input
              type="hidden"
              {...updateProps.getNameProp('recordType')}
              value="Area"
            />
            <FormTextField
              key={item.name}
              {...updateProps.getNameProp('name')}
              disabled={isUpdating}
              defaultValue={item.name}
              className="cursor-pointer"
              camouflage
            />
          </ActionContextProvider>
        </updateFetcher.Form>
        <deleteFetcher.Form
          method="post"
          action={AppLinks.DeleteRecord}
          className="flex flex-col items-center justify-center"
        >
          <ActionContextProvider
            {...updateFetcher.data}
            isSubmitting={updateProps.isProcessing}
          >
            <input
              type="hidden"
              {...deleteProps.getNameProp('id')}
              value={item.id}
            />
            <input
              type="hidden"
              {...deleteProps.getNameProp('recordType')}
              value="Area"
            />
            <GhostButton
              type="submit"
              className="group p-0"
              title="Remove item"
              disabled={isUpdating}
            >
              <X className="text-red-600 transition-all duration-300 group-hover:rotate-90" />
            </GhostButton>
          </ActionContextProvider>
        </deleteFetcher.Form>
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

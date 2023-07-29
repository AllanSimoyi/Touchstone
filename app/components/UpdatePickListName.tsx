import type { FetcherWithComponents } from '@remix-run/react';
import type { RECORD_TYPES } from '~/models/core.validations';

import { AppLinks } from '~/models/links';

import { ActionContextProvider } from './ActionContextProvider';
import { FormTextField } from './FormTextField';
import { InputRecordType } from './InputRecordType';

interface Props {
  fetcher: FetcherWithComponents<any>;
  id: number;
  name: string;
  recordType: (typeof RECORD_TYPES)[number];
}
export function UpdatePickListName(props: Props) {
  const { fetcher, id, name, recordType } = props;
  const isUpdating = fetcher.state !== 'idle';
  return (
    <fetcher.Form method="post" action={AppLinks.UpdateRecord} className="grow">
      <ActionContextProvider {...fetcher.data} isSubmitting={isUpdating}>
        <input type="hidden" name="id" value={id} />
        <InputRecordType value={recordType} />
        <FormTextField
          camouflage
          key={name}
          name="name"
          defaultValue={name}
          disabled={isUpdating}
          className="cursor-pointer"
        />
      </ActionContextProvider>
    </fetcher.Form>
  );
}

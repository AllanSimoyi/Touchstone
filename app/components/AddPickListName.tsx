import type { FetcherWithComponents } from '@remix-run/react';
import type { RefObject } from 'react';
import type { RECORD_TYPES } from '~/models/core.validations';

import { Plus } from 'tabler-icons-react';

import { hasFormError } from '~/models/forms';
import { AppLinks } from '~/models/links';

import { ActionContextProvider } from './ActionContextProvider';
import { FormTextField } from './FormTextField';
import { InlineAlert } from './InlineAlert';
import { InputRecordType } from './InputRecordType';
import { SecondaryButton } from './SecondaryButton';

interface Props {
  fetcher: FetcherWithComponents<any>;
  recordType: (typeof RECORD_TYPES)[number];
  customRef: RefObject<HTMLInputElement>;
}
export function AddPickListName(props: Props) {
  const { fetcher, recordType, customRef } = props;
  const isAdding = fetcher.state !== 'idle';
  return (
    <>
      <fetcher.Form
        method="post"
        action={AppLinks.AddRecord}
        className="flex flex-row items-start gap-2"
      >
        <ActionContextProvider {...fetcher.data} isSubmitting={isAdding}>
          <InputRecordType value={recordType} />
          <div className="flex grow flex-col items-stretch">
            <FormTextField
              customRef={customRef}
              name="name"
              placeholder="Enter new item"
              className="px-4"
            />
          </div>
          <SecondaryButton type="submit" isIcon>
            <Plus className="text-zinc-600" />
          </SecondaryButton>
        </ActionContextProvider>
      </fetcher.Form>
      {hasFormError(fetcher.data) && (
        <InlineAlert>{fetcher.data.formError}</InlineAlert>
      )}
    </>
  );
}

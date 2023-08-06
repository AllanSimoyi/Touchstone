import type { FetcherWithComponents } from '@remix-run/react';
import type { ChangeEvent } from 'react';
import type { SupportJobType } from '~/models/support-jobs';

import dayjs from 'dayjs';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useFieldClearOnSuccess } from '~/hooks/useFieldClearOnSuccess';
import { AddSupportJobSchema } from '~/models/core.validations';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import { hasFormError } from '~/models/forms';
import { pad } from '~/models/strings';
import {
  SUPPORT_JOB_STATUSES,
  SUPPORT_JOB_TYPES,
  SupportJobTypeSchema,
} from '~/models/support-jobs';
import { useUser } from '~/utils';

import { useForm } from './ActionContextProvider';
import { FormSelect } from './FormSelect';
import { FormTextArea } from './FormTextArea';
import { FormTextField } from './FormTextField';
import { InlineAlert } from './InlineAlert';
import { ListItemDetail } from './ListItemDetail';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

interface Props {
  fetcher: FetcherWithComponents<any>;
  newJobId: number;
  accounts: { id: number; companyName: string }[];
  accountId: number;
  cancel: () => void;
}
export function AddJob(props: Props) {
  const { fetcher, newJobId, accounts, accountId, cancel } = props;
  const currentUser = useUser();

  const [supportType, setSupportType] = useState<SupportJobType>(
    SUPPORT_JOB_TYPES[1]
  );

  const onSupportTypeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const result = SupportJobTypeSchema.safeParse(event.currentTarget.value);
      if (result.success) {
        setSupportType(result.data);
      }
    },
    []
  );

  const accountIdRef = useRef<HTMLSelectElement>(null);
  const clientStaffNameRef = useRef<HTMLInputElement>(null);
  const supportPersonRef = useRef<HTMLInputElement>(null);
  const supportTypeRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const enquiryRef = useRef<HTMLTextAreaElement>(null);
  const actionTakenRef = useRef<HTMLTextAreaElement>(null);
  const chargeRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const { getNameProp } = useForm(fetcher.data, AddSupportJobSchema);

  const refs = useMemo(
    () => [
      clientStaffNameRef,
      accountIdRef,
      clientStaffNameRef,
      supportPersonRef,
      supportTypeRef,
      statusRef,
      enquiryRef,
      actionTakenRef,
      chargeRef,
      dateRef,
    ],
    []
  );

  useFieldClearOnSuccess(fetcher.data, refs);

  const handleCancel = useCallback(() => {
    refs.forEach((ref) => {
      if (ref.current) {
        ref.current.value = '';
      }
    });
    cancel();
  }, [refs, cancel]);

  return (
    <div
      key={'Add New Job'}
      className="flex flex-col items-stretch gap-6 rounded-md border border-zinc-200 bg-white p-4 shadow-lg"
    >
      <div className="flex flex-col items-start">
        <span className="text-lg font-semibold">New Support Job</span>
      </div>
      <div className="relative flex flex-row items-stretch justify-start gap-10">
        <div className="flex flex-col items-stretch whitespace-nowrap">
          <ListItemDetail
            subtitle="Job #"
            detail={pad(newJobId.toString(), 4, '0')}
          />
        </div>
        <div className="grid grow grid-cols-1 gap-6 sm:grid-cols-3 md:grid-cols-4">
          <ListItemDetail
            subtitle="Company"
            detail={
              <FormSelect
                key={accountId}
                customRef={accountIdRef}
                defaultValue={accountId}
                {...getNameProp('accountId')}
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.companyName}
                  </option>
                ))}
              </FormSelect>
            }
          />
          <ListItemDetail
            subtitle="Company Staff Member"
            detail={
              <FormTextField
                customRef={clientStaffNameRef}
                {...getNameProp('clientStaffName')}
              />
            }
          />
          <ListItemDetail
            subtitle="Support Person"
            detail={
              <FormTextField
                defaultValue={currentUser.username}
                customRef={supportPersonRef}
                {...getNameProp('supportPerson')}
              />
            }
          />
          <ListItemDetail
            subtitle="Status"
            detail={
              <FormSelect
                customRef={statusRef}
                {...getNameProp('status')}
                defaultValue={SUPPORT_JOB_STATUSES[2]}
              >
                {SUPPORT_JOB_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </FormSelect>
            }
          />
          <ListItemDetail
            subtitle="Type of Work"
            detail={
              <FormSelect
                customRef={supportTypeRef}
                name="fake"
                defaultValue={supportType}
                onChange={onSupportTypeChange}
              >
                {SUPPORT_JOB_TYPES.map((jobType) => (
                  <option key={jobType} value={jobType}>
                    {jobType}
                  </option>
                ))}
              </FormSelect>
            }
          />
          <input
            type="hidden"
            {...getNameProp('supportType')}
            value={JSON.stringify([supportType])}
          />
          <ListItemDetail
            subtitle="Charge, if any"
            detail={
              <FormTextField
                type="number"
                step=".01"
                required={false}
                customRef={chargeRef}
                {...getNameProp('charge')}
              />
            }
          />
          <ListItemDetail
            subtitle="Date"
            detail={
              <FormTextField
                type="date"
                customRef={dateRef}
                defaultValue={dayjs().format(DATE_INPUT_FORMAT)}
                {...getNameProp('date')}
              />
            }
          />
          <div className="col-span-2 flex flex-col items-stretch">
            <ListItemDetail
              subtitle="Enquiry"
              detail={
                <FormTextArea
                  rows={2}
                  customRef={enquiryRef}
                  {...getNameProp('enquiry')}
                />
              }
            />
          </div>
          <div className="col-span-2 flex flex-col items-stretch">
            <ListItemDetail
              subtitle="Action Taken"
              detail={
                <FormTextArea
                  rows={2}
                  required={false}
                  customRef={actionTakenRef}
                  {...getNameProp('actionTaken')}
                />
              }
            />
          </div>
          {!!hasFormError(fetcher.data) && (
            <div className="flex flex-col items-start">
              <InlineAlert className="p-2 text-xs">
                {fetcher.data.formError}
              </InlineAlert>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row items-stretch gap-4">
        <div className="grow" />
        <SecondaryButton type="button" onClick={handleCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit">Record</PrimaryButton>
      </div>
    </div>
  );
}
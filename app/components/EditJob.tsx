import type { FetcherWithComponents } from '@remix-run/react';
import type { ChangeEvent } from 'react';
import type { SupportJobType } from '~/models/support-jobs';

import dayjs from 'dayjs';
import { useCallback, useRef, useState } from 'react';

import { UpdateSupportJobSchema } from '~/models/core.validations';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import { hasFormError } from '~/models/forms';
import {
  SUPPORT_JOB_STATUSES,
  SUPPORT_JOB_TYPES,
  SupportJobTypeSchema,
} from '~/models/support-jobs';
import { useUser } from '~/utils';

import { useField, useForm } from './ActionContextProvider';
import { FormSelect } from './FormSelect';
import { FormTextArea } from './FormTextArea';
import { FormTextField } from './FormTextField';
import { InlineAlert } from './InlineAlert';
import { ListItemDetail } from './ListItemDetail';

interface Props {
  fetcher: FetcherWithComponents<any>;
  accounts: { id: number; companyName: string }[];
}
export function EditJob(props: Props) {
  const { fetcher, accounts } = props;
  const currentUser = useUser();

  const getValidatedSupportType = useCallback((data: unknown) => {
    const result = SupportJobTypeSchema.safeParse(data);
    if (!result.success) {
      return undefined;
    }
    return result.data;
  }, []);

  const { getNameProp } = useForm(fetcher.data, UpdateSupportJobSchema);

  const { value: defaultSupportType } = useField(
    getNameProp('supportType').name
  );

  const [supportType, setSupportType] = useState<SupportJobType>(
    getValidatedSupportType(defaultSupportType) || SUPPORT_JOB_TYPES[1]
  );

  const onSupportTypeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const newSupportType = getValidatedSupportType(event.currentTarget.value);
      if (newSupportType) {
        setSupportType(newSupportType);
      }
    },
    [getValidatedSupportType]
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

  // const refs = useMemo(
  //   () => [
  //     clientStaffNameRef,
  //     accountIdRef,
  //     clientStaffNameRef,
  //     supportPersonRef,
  //     supportTypeRef,
  //     statusRef,
  //     enquiryRef,
  //     actionTakenRef,
  //     chargeRef,
  //     dateRef,
  //   ],
  //   []
  // );

  // useFieldClearOnSuccess(fetcher.data, refs);

  // const handleCancel = useCallback(() => {
  //   refs.forEach((ref) => {
  //     if (ref.current) {
  //       ref.current.value = '';
  //     }
  //   });
  //   cancel();
  // }, [refs, cancel]);

  return (
    <div className="grid grow grid-cols-1 gap-6 sm:grid-cols-3 md:grid-cols-4">
      <ListItemDetail
        subtitle="Company"
        detail={
          <FormSelect customRef={accountIdRef} {...getNameProp('accountId')}>
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
  );
}

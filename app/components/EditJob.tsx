import type { FetcherWithComponents } from '@remix-run/react';

import dayjs from 'dayjs';
import { useRef } from 'react';

import { UpdateSupportJobSchema } from '~/models/core.validations';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import { hasFormError } from '~/models/forms';
import { SUPPORT_JOB_STATUSES } from '~/models/support-jobs';
import { useUser } from '~/utils';

import { useForm } from './ActionContextProvider';
import { FormSelect } from './FormSelect';
import { FormTextArea } from './FormTextArea';
import { FormTextField } from './FormTextField';
import { InlineAlert } from './InlineAlert';
import { ListItemDetail } from './ListItemDetail';
import { SelectCompany } from './SelectCompany';
import { SupportTypesMultiSelect } from './SupportTypesMultiSelect';

interface Props {
  fetcher: FetcherWithComponents<any>;
  accounts: { id: number; companyName: string }[];
}
export function EditJob(props: Props) {
  const { fetcher, accounts } = props;
  const currentUser = useUser();

  const { getNameProp } = useForm(fetcher.data, UpdateSupportJobSchema);

  const clientStaffNameRef = useRef<HTMLInputElement>(null);
  const supportPersonRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const enquiryRef = useRef<HTMLTextAreaElement>(null);
  const actionTakenRef = useRef<HTMLTextAreaElement>(null);
  const chargeRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid grow grid-cols-1 gap-6 sm:grid-cols-3 md:grid-cols-4">
      <ListItemDetail
        subtitle="Company"
        detail={
          <SelectCompany {...getNameProp('accountId')} accounts={accounts} />
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
          subtitle="Type of Work"
          detail={
            <SupportTypesMultiSelect name={getNameProp('supportType').name} />
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

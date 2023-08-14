import type { RECORD_TYPES } from '~/models/core.validations';

import { json, type LoaderArgs } from '@remix-run/node';
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';

import {
  ActionContextProvider,
  useForm,
} from '~/components/ActionContextProvider';
import { Card } from '~/components/Card';
import { CenteredView } from '~/components/CenteredView';
import { FormSelect } from '~/components/FormSelect';
import { FormTextArea } from '~/components/FormTextArea';
import { FormTextField } from '~/components/FormTextField';
import { InlineAlert } from '~/components/InlineAlert';
import { InputRecordType } from '~/components/InputRecordType';
import { ListItemDetail } from '~/components/ListItemDetail';
import { PrimaryButton } from '~/components/PrimaryButton';
import { SelectCompany } from '~/components/SelectCompany';
import { SelectSupportPerson } from '~/components/SelectSupportPerson';
import { SupportTypesMultiSelect } from '~/components/SupportTypesMultiSelect';
import { Toolbar } from '~/components/Toolbar';
import { prisma } from '~/db.server';
import { useFieldClearOnSuccess } from '~/hooks/useFieldClearOnSuccess';
import { AddSupportJobSchema, hasSuccess } from '~/models/core.validations';
import { DATE_INPUT_FORMAT, delay } from '~/models/dates';
import { hasFormError } from '~/models/forms';
import { AppLinks } from '~/models/links';
import { pad } from '~/models/strings';
import { SUPPORT_JOB_STATUSES } from '~/models/support-jobs';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

const RecordType: (typeof RECORD_TYPES)[number] = 'SupportJob';
export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  const [lastJob, accounts, users] = await Promise.all([
    prisma.supportJob.findFirst({
      select: { id: true },
      orderBy: { id: 'desc' },
    }),
    prisma.account.findMany({
      select: { id: true, companyName: true },
    }),
    prisma.user.findMany({
      select: { id: true, username: true },
    }),
  ]);

  const newJobId = lastJob ? lastJob.id + 1 : 1;

  return json({ newJobId, accounts, users });
}

export default function SupportJobsCreate() {
  const currentUser = useUser();
  const { newJobId, accounts, users } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const navigate = useNavigate();

  const { getNameProp, isProcessing } = useForm(
    fetcher.data,
    AddSupportJobSchema
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

  const refs = useMemo(
    () => [
      accountIdRef,
      clientStaffNameRef,
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

  useEffect(() => {
    if (hasSuccess(fetcher.data)) {
      toast.success('Support job added');
      delay(2_000);
      navigate(AppLinks.SupportJobs);
    }
  }, [fetcher.data, navigate]);

  // const defaultValues: Record<
  //   keyof z.infer<typeof AddSupportJobSchema>,
  //   string
  // > = {
  //   recordType: 'SupportJob',
  //   accountId: accounts[0]?.id.toString() || '',
  //   clientStaffName: faker.person.fullName(),
  //   supportPersonId: users[0]?.id.toString() || '',
  //   supportType: SUPPORT_JOB_TYPES[1],
  //   status: SUPPORT_JOB_STATUSES[2],
  //   enquiry: faker.lorem.sentence(7),
  //   actionTaken: faker.lorem.paragraph(2),
  //   charge: faker.finance.amount(),
  //   date: dayjs(faker.date.past()).format(DATE_INPUT_FORMAT),
  //   userId: currentUser.id.toString(),
  // };

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={currentUser.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <CenteredView className="gap-6 px-2">
          <fetcher.Form
            key={'Add New Job'}
            method="post"
            action={AppLinks.AddRecord}
          >
            <ActionContextProvider
              {...fetcher.data}
              // fields={defaultValues}
              isSubmitting={isProcessing}
            >
              <InputRecordType value={RecordType} />
              <input
                type="hidden"
                {...getNameProp('userId')}
                value={currentUser.id}
              />
              <div className="flex flex-col items-start py-6">
                <span className="text-lg font-semibold">New Support Job</span>
              </div>
              <Card className="gap-6 p-4">
                <div className="flex flex-row items-stretch justify-start gap-10">
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
                        <SelectCompany
                          {...getNameProp('accountId')}
                          accounts={accounts}
                        />
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
                        <SelectSupportPerson
                          {...getNameProp('supportPersonId')}
                          users={users}
                          defaultUserId={currentUser.id}
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
                          <SupportTypesMultiSelect
                            name={getNameProp('supportType').name}
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
                </div>
                <div className="flex flex-col items-end">
                  <PrimaryButton type="submit">Record</PrimaryButton>
                </div>
              </Card>
            </ActionContextProvider>
          </fetcher.Form>
        </CenteredView>
      </div>
    </div>
  );
}

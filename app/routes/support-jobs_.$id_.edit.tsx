import type { z } from 'zod';
import type { RECORD_TYPES } from '~/models/core.validations';

import { json, type LoaderArgs } from '@remix-run/node';
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import {
  ActionContextProvider,
  useForm,
} from '~/components/ActionContextProvider';
import { Breadcrumb } from '~/components/Breadcrumb';
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
import {
  StatusCode,
  UpdateSupportJobSchema,
  getValidatedId,
  hasSuccess,
} from '~/models/core.validations';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import { hasFields, hasFormError } from '~/models/forms';
import { AppLinks } from '~/models/links';
import { pad } from '~/models/strings';
import { SUPPORT_JOB_STATUSES } from '~/models/support-jobs';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

const RecordType: (typeof RECORD_TYPES)[number] = 'SupportJob';
export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);

  const id = getValidatedId(params.id);

  const [job, accounts, users] = await Promise.all([
    prisma.supportJob
      .findUnique({
        where: { id },
        select: {
          id: true,
          account: { select: { id: true, companyName: true } },
          clientStaffName: true,
          supportPerson: { select: { id: true, username: true } },
          supportType: true,
          status: true,
          enquiry: true,
          actionTaken: true,
          charge: true,
          date: true,
          user: { select: { id: true, username: true } },
        },
      })
      .then((job) => {
        if (!job) {
          return undefined;
        }
        return {
          ...job,
          date: dayjs(job.date).format(DATE_INPUT_FORMAT),
        };
      }),
    prisma.account.findMany({
      select: { id: true, companyName: true },
    }),
    prisma.user.findMany({
      select: { id: true, username: true },
    }),
  ]);

  if (!job) {
    throw new Response('Support job not found', {
      status: StatusCode.NotFound,
    });
  }

  return json({ job, accounts, users });
}

export default function SupportJobsCreate() {
  const currentUser = useUser();
  const { job, accounts, users } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const navigate = useNavigate();

  const { getNameProp, isProcessing } = useForm(
    fetcher.data,
    UpdateSupportJobSchema
  );

  // const accountIdRef = useRef<HTMLSelectElement>(null);
  const clientStaffNameRef = useRef<HTMLInputElement>(null);
  // const supportPersonRef = useRef<HTMLInputElement>(null);
  // const supportTypeRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const enquiryRef = useRef<HTMLTextAreaElement>(null);
  const actionTakenRef = useRef<HTMLTextAreaElement>(null);
  const chargeRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  // const refs = useMemo(
  //   () => [
  //     accountIdRef,
  //     clientStaffNameRef,
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

  useEffect(() => {
    if (hasSuccess(fetcher.data)) {
      toast.success('Support job updated', { duration: 5_000 });
    }
  }, [fetcher.data, navigate]);

  const defaultValues: Record<
    keyof z.infer<typeof UpdateSupportJobSchema>,
    string
  > = {
    recordType: 'SupportJob',
    id: job.id.toString(),
    accountId: job.account.id.toString(),
    clientStaffName: job.clientStaffName,
    supportPersonId: job.supportPerson.id.toString(),
    supportType: job.supportType,
    status: job.status,
    enquiry: job.enquiry,
    actionTaken: job.actionTaken,
    charge: job.charge,
    date: job.date,
    userId: job.user.id.toString(),
  };

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={currentUser.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <CenteredView className="gap-6 px-2">
          <fetcher.Form method="post" action={AppLinks.UpdateRecord}>
            <ActionContextProvider
              {...fetcher.data}
              fields={
                hasFields(fetcher.data) ? fetcher.data.fields : defaultValues
              }
              isSubmitting={isProcessing}
            >
              <InputRecordType value={RecordType} />
              <input type="hidden" {...getNameProp('id')} value={job.id} />
              <input
                type="hidden"
                {...getNameProp('userId')}
                value={currentUser.id}
              />
              <div className="flex flex-col items-stretch py-6">
                <Breadcrumb
                  items={[
                    [AppLinks.SupportJobs, 'Support Jobs'],
                    'Edit Support Job',
                  ]}
                />
              </div>
              <Card className="gap-6 p-4">
                <div className="flex flex-row items-stretch justify-start gap-10">
                  <div className="flex flex-col items-stretch whitespace-nowrap">
                    <ListItemDetail
                      subtitle="Job #"
                      detail={pad(job.id.toString(), 4, '0')}
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
                        />
                      }
                    />
                    <ListItemDetail
                      subtitle="Status"
                      detail={
                        <FormSelect
                          customRef={statusRef}
                          {...getNameProp('status')}
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
                  <PrimaryButton type="submit">Update</PrimaryButton>
                </div>
              </Card>
            </ActionContextProvider>
          </fetcher.Form>
        </CenteredView>
      </div>
    </div>
  );
}

import type { ComponentProps } from 'react';

import { faker } from '@faker-js/faker';
import { Link, useFetcher } from '@remix-run/react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { ChevronRight } from 'tabler-icons-react';
import { z } from 'zod';

import { useFormData } from '~/hooks/useFormData';
import {
  AddSupportJobSchema,
  hasSuccess,
  type RECORD_TYPES,
} from '~/models/core.validations';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import { AppLinks } from '~/models/links';
import {
  SUPPORT_JOB_STATUSES,
  SUPPORT_JOB_TYPES,
  type SupportJobStatus,
  type SupportJobType,
} from '~/models/support-jobs';
import { showToast } from '~/models/toast';
import { useUser } from '~/utils';

import { ActionContextProvider, useForm } from './ActionContextProvider';
import { AddJob } from './AddJob';
import { InputRecordType } from './InputRecordType';
import { JobListItem } from './JobListItem';
import { PrimaryButton } from './PrimaryButton';
import { UnderLineOnHover } from './UnderLineOnHover';

interface Props {
  newJobId: number;
  accounts: { id: number; companyName: string }[];
  jobs: ComponentProps<typeof JobListItem>[];
}
const RecordType: (typeof RECORD_TYPES)[number] = 'SupportJob';
export function JobList(props: Props) {
  const currentUser = useUser();
  const { newJobId, jobs } = props;

  const [addCardIsOpen, setAddCardIsOpen] = useState(false);

  const fetcher = useFetcher();
  const { getNameProp, isProcessing } = useForm(
    fetcher.data,
    AddSupportJobSchema
  );

  useEffect(() => {
    if (hasSuccess(fetcher.data)) {
      setAddCardIsOpen(false);
      showToast('success', 'Support job added');
    }
  }, [fetcher.data]);

  const rawOptimisticItem = useFormData(
    fetcher.submission?.formData,
    AddSupportJobSchema,
    [
      'recordType',
      'company',
      'clientStaffName',
      'supportPerson',
      'supportType',
      'status',
      'enquiry',
      'actionTaken',
      'charge',
      'date',
      'userId',
    ]
  );

  const optimisticItem = (() => {
    try {
      if (!rawOptimisticItem || !rawOptimisticItem.supportType) {
        return rawOptimisticItem;
      }
      const result = z
        .string()
        .array()
        .safeParse(JSON.parse(rawOptimisticItem.supportType));
      if (!result.success) {
        return rawOptimisticItem;
      }
      return { ...rawOptimisticItem, supportType: result.data };
    } catch (error) {
      return rawOptimisticItem;
    }
  })();

  const defaultValues: Record<
    keyof z.infer<typeof AddSupportJobSchema>,
    string
  > = {
    recordType: 'SupportJob',
    company: faker.company.name(),
    clientStaffName: faker.person.fullName(),
    supportPerson: faker.person.fullName(),
    supportType: SUPPORT_JOB_TYPES[1],
    status: SUPPORT_JOB_STATUSES[2],
    enquiry: faker.lorem.sentence(7),
    actionTaken: faker.lorem.paragraph(2),
    charge: faker.finance.amount(),
    date: dayjs(faker.date.past()).format(DATE_INPUT_FORMAT),
    userId: currentUser.id.toString(),
  };

  return (
    <div className="flex flex-col items-stretch">
      <div className="flex flex-row items-start">
        <h2 className="flex flex-row items-stretch gap-2 text-2xl font-semibold">
          <span className="text-zinc-800">Support Jobs</span>
          <div className="flex flex-col items-center justify-center">
            <ChevronRight className="text-zinc-400" />
          </div>
          <Link to={AppLinks.SupportJobStats}>
            <UnderLineOnHover>
              <span className="text-zinc-400 transition-all duration-150 hover:text-zinc-800">
                Analytics
              </span>
            </UnderLineOnHover>
          </Link>
        </h2>
        <div className="grow" />
        {!addCardIsOpen && (
          <PrimaryButton type="button" onClick={() => setAddCardIsOpen(true)}>
            Record New Job
          </PrimaryButton>
        )}
      </div>
      <div className="flex flex-col items-stretch justify-center gap-4 py-4">
        {addCardIsOpen && (
          <fetcher.Form
            key={'Add New Job'}
            method="post"
            action={AppLinks.AddRecord}
            className="pb-4"
          >
            <ActionContextProvider
              {...fetcher.data}
              fields={defaultValues}
              isSubmitting={isProcessing}
            >
              <InputRecordType value={RecordType} />
              <input
                type="hidden"
                {...getNameProp('userId')}
                value={currentUser.id}
              />
              <AddJob
                fetcher={fetcher}
                newJobId={newJobId}
                cancel={() => setAddCardIsOpen(false)}
              />
            </ActionContextProvider>
          </fetcher.Form>
        )}
        {!!jobs.length && (
          <div className="flex flex-col items-stretch gap-4">
            {!!optimisticItem?.clientStaffName && (
              <JobListItem
                {...optimisticItem}
                id={newJobId}
                company={optimisticItem.company || ''}
                clientStaffName={optimisticItem.clientStaffName || ''}
                supportPerson={optimisticItem.supportPerson || ''}
                supportTypes={[optimisticItem.supportType as SupportJobType]}
                status={optimisticItem.status as SupportJobStatus}
                enquiry={optimisticItem.enquiry || ''}
                actionTaken={optimisticItem.actionTaken || ''}
                charge={optimisticItem.charge || ''}
                date={optimisticItem.date || ''}
                user={currentUser}
                menuIsDisabled
              />
            )}
            {jobs.map((job) => (
              <JobListItem key={job.id} {...job} />
            ))}
          </div>
        )}
        {!jobs.length && (
          <div className="flex flex-col items-center justify-center px-2 py-6">
            <span className="text-base font-light text-zinc-400">
              No support jobs found
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

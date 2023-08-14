import type { ComponentProps } from 'react';

import { Link, useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { ChevronRight } from 'tabler-icons-react';
import { z } from 'zod';

import { useFormData } from '~/hooks/useFormData';
import { AddSupportJobSchema, hasSuccess } from '~/models/core.validations';
import { AppLinks } from '~/models/links';
import {
  type SupportJobStatus,
  type SupportJobType,
} from '~/models/support-jobs';
import { useUser } from '~/utils';

import { JobListItem } from './JobListItem';
import { PrimaryButtonLink } from './PrimaryButton';
import { UnderLineOnHover } from './UnderLineOnHover';

interface Props {
  newJobId: number;
  accounts: { id: number; companyName: string }[];
  users: { id: number; username: string }[];
  jobs: Omit<ComponentProps<typeof JobListItem>, 'accounts' | 'users'>[];
}
export function JobList(props: Props) {
  const currentUser = useUser();
  const { newJobId, accounts, users, jobs } = props;

  const fetcher = useFetcher();

  useEffect(() => {
    if (hasSuccess(fetcher.data)) {
      toast.success('Support job added');
    }
  }, [fetcher.data]);

  const rawOptimisticItem = useFormData(
    fetcher.submission?.formData,
    AddSupportJobSchema,
    [
      'recordType',
      'accountId',
      'clientStaffName',
      'supportPersonId',
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
        <PrimaryButtonLink to={AppLinks.CreateSupportJob}>
          Record New Job
        </PrimaryButtonLink>
      </div>
      <div className="flex flex-col items-stretch justify-center gap-4 py-4">
        {!!jobs.length && (
          <div className="flex flex-col items-stretch gap-4">
            {!!optimisticItem?.clientStaffName && (
              <JobListItem
                {...optimisticItem}
                id={newJobId}
                account={{
                  id: Number(optimisticItem.accountId) || 0,
                  companyName:
                    accounts.find(
                      (el) => el.id.toString() === optimisticItem.accountId
                    )?.companyName || '',
                }}
                clientStaffName={optimisticItem.clientStaffName || ''}
                supportPerson={{
                  id: Number(optimisticItem.userId) || 0,
                  username:
                    users.find(
                      (user) =>
                        user.id.toString() === optimisticItem.supportPersonId
                    )?.username || '',
                }}
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

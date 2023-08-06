import type { ChangeEvent } from 'react';
import type {
  JobSortByOption,
  JobSortOrderOption,
  SupportJobStatus,
  SupportJobType,
} from '~/models/support-jobs';

import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { RouteErrorBoundary } from '~/components/Boundaries';
import { Card } from '~/components/Card';
import { CenteredView } from '~/components/CenteredView';
import { DebouncedSearch } from '~/components/DebouncedSearch';
import { Footer } from '~/components/Footer';
import { JobList } from '~/components/JobList';
import { Select } from '~/components/Select';
import { Toolbar } from '~/components/Toolbar';
import { prisma } from '~/db.server';
import { RecordIdSchema } from '~/models/core.validations';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import { logParseError } from '~/models/logger.server';
import { pad } from '~/models/strings';
import {
  jobSortByOptions,
  JobSortByOptionSchema,
  jobSortOrderOptions,
  JobSortOrderOptionSchema,
  StrSupportJobTypeSchema,
  SUPPORT_JOB_STATUSES,
  SUPPORT_JOB_TYPES,
  SupportJobStatusSchema,
  SupportJobTypeSchema,
} from '~/models/support-jobs';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  const [jobs, accounts] = await Promise.all([
    prisma.supportJob
      .findMany({
        select: {
          id: true,
          account: { select: { id: true, companyName: true } },
          clientStaffName: true,
          supportPerson: true,
          supportType: true,
          status: true,
          enquiry: true,
          actionTaken: true,
          charge: true,
          date: true,
          user: { select: { id: true, username: true } },
        },
      })
      .then((jobs) =>
        jobs
          .map((job) => {
            const supportTypes = (() => {
              const result = StrSupportJobTypeSchema.safeParse(job.supportType);
              if (!result.success) {
                logParseError(request, result.error, job);
                return undefined;
              }
              return result.data;
            })();
            const status = (() => {
              const result = SupportJobStatusSchema.safeParse(job.status);
              if (!result.success) {
                logParseError(request, result.error, job);
                return undefined;
              }
              return result.data;
            })();
            if (!supportTypes || !status) {
              return undefined;
            }
            return {
              ...job,
              accountId: job.account.id,
              companyName: job.account.companyName,
              date: dayjs(job.date).format(DATE_INPUT_FORMAT),
              charge: job.charge.toFixed(2),
              supportTypes,
              status,
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.id - a.id)
      ),
    prisma.account.findMany({
      select: { id: true, companyName: true },
    }),
  ]);

  const newOrderId = jobs.length ? jobs[0].id + 1 : 1;

  return json({ jobs, accounts, newOrderId });
}

export default function SupportJobs() {
  const user = useUser();
  const {
    jobs: suppliedJobs,
    accounts,
    newOrderId,
  } = useLoaderData<typeof loader>();

  const [jobType, setJobType] = useState<SupportJobType | undefined>(undefined);
  const [accountId, setAccountId] = useState<number>(0);
  const [status, setStatus] = useState<SupportJobStatus | undefined>(undefined);
  const [sortBy, setSortBy] = useState<JobSortByOption>(jobSortByOptions[0]);
  const [sortOrder, setSortOrder] = useState<JobSortOrderOption>(
    jobSortOrderOptions[1]
  );
  const [searchTerms, setSearchTerms] = useState('');

  const onJobTypeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const result = SupportJobTypeSchema.or(z.literal('')).safeParse(
        event.currentTarget.value
      );
      if (!result.success) {
        return;
      }
      setJobType(result.data || undefined);
    },
    []
  );

  const onAccountChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const Schema = RecordIdSchema.or(z.literal('0').transform((_) => 0));
      const result = Schema.safeParse(event.currentTarget.value);
      if (!result.success) {
        return;
      }
      setAccountId(result.data);
    },
    []
  );

  const onStatusChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const result = SupportJobStatusSchema.or(z.literal('')).safeParse(
        event.currentTarget.value
      );
      if (!result.success) {
        return;
      }
      setStatus(result.data || undefined);
    },
    []
  );

  const onSortByChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const result = JobSortByOptionSchema.safeParse(event.currentTarget.value);
      if (!result.success) {
        return;
      }
      setSortBy(result.data);
    },
    []
  );

  const onSortOrderChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const result = JobSortOrderOptionSchema.safeParse(
        event.currentTarget.value
      );
      if (!result.success) {
        return;
      }
      setSortOrder(result.data);
    },
    []
  );

  const filterByJobType = useCallback(
    (jobs: typeof suppliedJobs) => {
      if (!jobType) {
        return jobs;
      }
      return jobs.filter((job) => job.supportTypes.includes(jobType));
    },
    [jobType]
  );

  const filterByAccount = useCallback(
    (jobs: typeof suppliedJobs) => {
      if (!accountId) {
        return jobs;
      }
      return jobs.filter((job) => job.accountId === accountId);
    },
    [accountId]
  );

  const filterByStatus = useCallback(
    (jobs: typeof suppliedJobs) => {
      if (!status) {
        return jobs;
      }
      return jobs.filter((job) => job.status === status);
    },
    [status]
  );

  const filterBySearchTerms = useCallback(
    (jobs: typeof suppliedJobs) => {
      if (!searchTerms) {
        return jobs;
      }
      return jobs.filter((job) => {
        const preppedSearchTerms = searchTerms.toLowerCase();
        const conditions: boolean[] = [
          pad(job.accountId.toString(), 4, '0').includes(preppedSearchTerms),
          job.companyName.toLowerCase().includes(preppedSearchTerms),
          job.clientStaffName.toLowerCase().includes(preppedSearchTerms),
          job.supportPerson.toLowerCase().includes(preppedSearchTerms),
          job.supportTypes
            .join(', ')
            .toLowerCase()
            .includes(preppedSearchTerms) || false,
          job.enquiry.toLowerCase().includes(preppedSearchTerms) || false,
          job.actionTaken.toLowerCase().includes(preppedSearchTerms) || false,
          job.status.toLowerCase().includes(preppedSearchTerms) || false,
          job.date.toLowerCase().includes(preppedSearchTerms) || false,
        ];
        return conditions.some((condition) => condition);
      });
    },
    [searchTerms]
  );

  const sortJobs = useCallback(
    (jobs: typeof suppliedJobs) => {
      if (sortBy === 'Order #') {
        return jobs.sort((a, b) => {
          if (sortOrder === 'A to Z') {
            return a.id - b.id;
          }
          return b.id - a.id;
        });
      }
      if (sortBy === 'Company Name') {
        return jobs.sort((a, b) => {
          if (sortOrder === 'A to Z') {
            return a.companyName.localeCompare(b.companyName);
          }
          return b.companyName.localeCompare(a.companyName);
        });
      }
      if (sortBy === 'Status') {
        return jobs.sort((a, b) => {
          if (sortOrder === 'A to Z') {
            return a.status.localeCompare(b.status);
          }
          return b.status.localeCompare(a.status);
        });
      }
      return jobs;
    },
    [sortBy, sortOrder]
  );

  const jobs = useMemo(() => {
    const filteredRecords = [
      filterByJobType,
      filterByStatus,
      filterByAccount,
      filterBySearchTerms,
    ].reduce((acc, fn) => fn(acc), suppliedJobs);
    return sortJobs(filteredRecords);
  }, [
    sortJobs,
    suppliedJobs,
    filterByJobType,
    filterByStatus,
    filterByAccount,
    filterBySearchTerms,
  ]);

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <CenteredView className="gap-6 px-2">
          <Card className="grid grid-cols-1 divide-x sm:grid-cols-2 md:grid-cols-6">
            <div className="flex flex-col items-stretch justify-center p-2">
              <Select
                isRow={false}
                name="typeOfWork"
                label="Type of Work"
                onChange={onJobTypeChange}
                defaultValue={jobType}
              >
                <option value="">All Types</option>
                {SUPPORT_JOB_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col items-stretch justify-center p-2">
              <Select
                isRow={false}
                name="areaId"
                label="Customer"
                defaultValue={accountId}
                onChange={onAccountChange}
              >
                <option value={0}>All Customers</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.companyName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col items-stretch justify-center p-2">
              <Select
                isRow={false}
                name="status"
                label="Status"
                onChange={onStatusChange}
                defaultValue={status}
              >
                <option value="">All Statuses</option>
                {SUPPORT_JOB_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col items-stretch justify-center p-2">
              <Select
                isRow={false}
                name="sortBy"
                label="Sort By"
                defaultValue={sortBy}
                onChange={onSortByChange}
              >
                {jobSortByOptions.map((sortOption) => (
                  <option key={sortOption} value={sortOption}>
                    {sortOption}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col items-stretch justify-center p-2">
              <Select
                isRow={false}
                name="sortOrder"
                label="Sort Order"
                defaultValue={sortOrder}
                onChange={onSortOrderChange}
              >
                {jobSortOrderOptions.map((sortOrder) => (
                  <option key={sortOrder} value={sortOrder}>
                    {sortOrder}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col items-stretch justify-end p-2 sm:col-span-2 md:col-span-1">
              <span className="text-base font-light text-zinc-600">Search</span>
              <DebouncedSearch runSearch={setSearchTerms} placeholder="" />
            </div>
          </Card>
          <JobList newOrderId={newOrderId} accounts={accounts} jobs={jobs} />
        </CenteredView>
      </div>
      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}

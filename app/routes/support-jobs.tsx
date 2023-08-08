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
import ReactSelect from 'react-select';
import { z } from 'zod';

import { RouteErrorBoundary } from '~/components/Boundaries';
import { Card } from '~/components/Card';
import { CenteredView } from '~/components/CenteredView';
import { DebouncedSearch } from '~/components/DebouncedSearch';
import { Footer } from '~/components/Footer';
import { JobList } from '~/components/JobList';
import { SearchTermContextProvider } from '~/components/SearchTermContextProvider';
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

  const newJobId = jobs.length ? jobs[0].id + 1 : 1;

  return json({ jobs, accounts, newJobId });
}

type ReactSelectOption = { value: number; label: string };

export default function SupportJobs() {
  const user = useUser();
  const {
    jobs: suppliedJobs,
    accounts,
    newJobId,
  } = useLoaderData<typeof loader>();

  const [jobType, setJobType] = useState<SupportJobType | undefined>(undefined);

  // const [accountId, setAccountId] = useState(0);
  const [accountOption, setAccountOption] = useState<
    ReactSelectOption | undefined
  >(undefined);

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

  // const onAccountIdChange = useCallback(
  //   (event: ChangeEvent<HTMLSelectElement>) => {
  //     const Schema = RecordIdSchema.or(z.literal('0').transform((_) => 0));
  //     const result = Schema.safeParse(event.currentTarget.value);
  //     if (!result.success) {
  //       return;
  //     }
  //     setAccountId(result.data);
  //   },
  //   []
  // );

  const onAccountChange = useCallback((newValue: unknown) => {
    const Schema = z
      .object({ value: RecordIdSchema, label: z.string() })
      .nullable();
    const result = Schema.safeParse(newValue);
    if (!result.success) {
      return;
    }
    setAccountOption(result.data || undefined);
  }, []);

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

  // const filterByAccount = useCallback(
  //   (jobs: typeof suppliedJobs) => {
  //     if (!accountId) {
  //       return jobs;
  //     }
  //     return jobs.filter((job) => job.account.id === accountId);
  //   },
  //   [accountId]
  // );

  const filterByAccount = useCallback(
    (jobs: typeof suppliedJobs) => {
      if (!accountOption) {
        return jobs;
      }
      return jobs.filter((job) => job.account.id === accountOption.value);
    },
    [accountOption]
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
        const lowercaseSearchTerms = searchTerms.toLowerCase();
        const conditions: boolean[] = [
          pad(job.id.toString(), 4, '0').includes(lowercaseSearchTerms),
          job.account.companyName.toLowerCase().includes(lowercaseSearchTerms),
          job.clientStaffName.toLowerCase().includes(lowercaseSearchTerms),
          job.supportPerson.toLowerCase().includes(lowercaseSearchTerms),
          job.supportTypes
            .join(', ')
            .toLowerCase()
            .includes(lowercaseSearchTerms) || false,
          job.enquiry.toLowerCase().includes(lowercaseSearchTerms) || false,
          job.actionTaken.toLowerCase().includes(lowercaseSearchTerms) || false,
          job.status.toLowerCase().includes(lowercaseSearchTerms) || false,
          job.date.toLowerCase().includes(lowercaseSearchTerms) || false,
          job.charge.toLowerCase().includes(lowercaseSearchTerms) || false,
          job.user.username.toLowerCase().includes(lowercaseSearchTerms) ||
            false,
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
            return a.account.companyName.localeCompare(b.account.companyName);
          }
          return b.account.companyName.localeCompare(a.account.companyName);
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
              <div className="flex flex-col items-start justify-center">
                <span className="text-base font-light text-zinc-600">
                  Company
                </span>
              </div>
              <ReactSelect
                isClearable
                name="selectCompany"
                classNamePrefix="select"
                options={accounts.map((account) => ({
                  value: account.id,
                  label: account.companyName,
                }))}
                value={accountOption}
                onChange={onAccountChange}
                placeholder="Select company"
                classNames={{
                  control: () =>
                    'rounded-md border border-zinc-200 bg-zinc-50 text-base font-light shadow-inner outline-none focus:ring-1 focus:ring-zinc-400',
                }}
              />
              {/* <Select
                isRow={false}
                name="company"
                label="Company"
                onChange={onAccountIdChange}
                defaultValue={accountId}
              >
                <option value="">All Companies</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.companyName}>
                    {account.companyName}
                  </option>
                ))}
              </Select> */}
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
          <SearchTermContextProvider searchTerms={searchTerms}>
            <JobList newJobId={newJobId} accounts={accounts} jobs={jobs} />
          </SearchTermContextProvider>
        </CenteredView>
      </div>
      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}

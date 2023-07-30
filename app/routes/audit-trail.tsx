import type { LoaderArgs } from '@remix-run/node';
import type { ChangeEvent } from 'react';
import type { EventKindDetails } from '~/models/events';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

import { RouteErrorBoundary } from '~/components/Boundaries';
import { Card } from '~/components/Card';
import { CenteredView } from '~/components/CenteredView';
import { EventChips } from '~/components/EventChips';
import { Footer } from '~/components/Footer';
import { Select } from '~/components/Select';
import { TextField } from '~/components/TextField';
import { Toolbar } from '~/components/Toolbar';
import { prisma } from '~/db.server';
import { getQueryParams } from '~/models/core.validations';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import {
  EVENT_KINDS,
  EventKind,
  EventKindDetailsSchema,
} from '~/models/events';
import { customServerLog, logParseError } from '~/models/logger.server';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

type CustomEvent = EventKindDetails & {
  table: string;
  id: number;
  createdAt: Date;
  user: { id: number; username: string };
};

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);

  let minDate: Date | undefined = undefined;

  const rawQueryParams = getQueryParams(request.url, ['minDate']);
  const result = z.coerce.date().safeParse(rawQueryParams.minDate);
  if (!result.success) {
    logParseError(request, result.error, rawQueryParams.minDate);
  } else {
    minDate = result.data;
  }

  const [users, ...events] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, username: true },
    }),
    prisma.accountEvent
      .findMany({
        select: {
          id: true,
          kind: true,
          details: true,
          createdAt: true,
          user: { select: { id: true, username: true } },
        },
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          table: 'Account',
        }))
      ),
    prisma.areaEvent
      .findMany({
        select: {
          id: true,
          kind: true,
          details: true,
          createdAt: true,
          user: { select: { id: true, username: true } },
        },
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          table: 'Area',
        }))
      ),
    prisma.cityEvent
      .findMany({
        select: {
          id: true,
          kind: true,
          details: true,
          createdAt: true,
          user: { select: { id: true, username: true } },
        },
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          table: 'City',
        }))
      ),
    prisma.databaseEvent
      .findMany({
        select: {
          id: true,
          kind: true,
          details: true,
          createdAt: true,
          user: { select: { id: true, username: true } },
        },
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          table: 'Database',
        }))
      ),
    prisma.groupEvent
      .findMany({
        select: {
          id: true,
          kind: true,
          details: true,
          createdAt: true,
          user: { select: { id: true, username: true } },
        },
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          table: 'Group',
        }))
      ),
    prisma.licenseDetailEvent
      .findMany({
        select: {
          id: true,
          kind: true,
          details: true,
          createdAt: true,
          user: { select: { id: true, username: true } },
        },
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          table: 'LicenseDetail',
        }))
      ),
    prisma.licenseEvent
      .findMany({
        select: {
          id: true,
          kind: true,
          details: true,
          createdAt: true,
          user: { select: { id: true, username: true } },
        },
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          table: 'License',
        }))
      ),
    prisma.operatorEvent
      .findMany({
        select: {
          id: true,
          kind: true,
          details: true,
          createdAt: true,
          user: { select: { id: true, username: true } },
        },
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          table: 'Operator',
        }))
      ),
    prisma.sectorEvent
      .findMany({
        select: {
          id: true,
          kind: true,
          details: true,
          createdAt: true,
          user: { select: { id: true, username: true } },
        },
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          table: 'Sector',
        }))
      ),
    prisma.statusEvent
      .findMany({
        select: {
          id: true,
          kind: true,
          details: true,
          createdAt: true,
          user: { select: { id: true, username: true } },
        },
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          table: 'Status',
        }))
      ),
    prisma.userEvent
      .findMany({
        select: {
          id: true,
          kind: true,
          details: true,
          createdAt: true,
          user: { select: { id: true, username: true } },
        },
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          table: 'User',
        }))
      ),
  ]).then(([users, ...events]) => {
    const result: CustomEvent[] = events.reduce((acc: CustomEvent[], batch) => {
      const preppedBatch: CustomEvent[] = batch
        .map(({ kind, details, ...event }) => {
          try {
            const parsedDetails = JSON.parse(details);
            const result = EventKindDetailsSchema.safeParse({
              kind,
              details: parsedDetails,
            });
            if (!result.success) {
              logParseError(request, result.error, event);
              return undefined;
            }
            return { ...event, ...result.data };
          } catch (error) {
            customServerLog(
              'error',
              'Failed to parse event details field',
              event,
              request
            );
            return undefined;
          }
        })
        .filter(Boolean);
      return [...acc, ...preppedBatch];
    }, [] as CustomEvent[]);
    return [users, ...result] as const;
  });

  return json({ users, events, minDate });
};

const TABLES = [
  'Account',
  'Area',
  'City',
  'Database',
  'Group',
  'LicenseDetail',
  'License',
  'Operator',
  'Sector',
  'Status',
  'User',
] as const;

export default function AuditPage() {
  const user = useUser();
  const { users, events: initEvents, minDate } = useLoaderData<typeof loader>();

  const [userId, setUserId] = useState<number>(0);
  const [kind, setKind] = useState<EventKind | ''>('');
  const [table, setTable] = useState<(typeof TABLES)[number] | ''>('');
  const [from, setFrom] = useState<Date | ''>(
    minDate ? dayjs(minDate).toDate() : ''
  );
  const [to, setTo] = useState<Date | ''>('');

  const onUserIdChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const Schema = z.coerce.number().int();
      const result = Schema.safeParse(event.currentTarget.value);
      if (!result.success) {
        return;
      }
      setUserId(result.data);
    },
    []
  );

  const onKindChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const Schema = z.nativeEnum(EventKind).or(z.literal(''));
    const result = Schema.safeParse(event.currentTarget.value);
    if (!result.success) {
      return;
    }
    setKind(result.data);
  }, []);

  const onTableChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const Schema = z.enum(TABLES).or(z.literal(''));
    const result = Schema.safeParse(event.currentTarget.value);
    if (!result.success) {
      return;
    }
    setTable(result.data);
  }, []);

  const onFromChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const Schema = z.coerce.date().or(z.literal(''));
    const result = Schema.safeParse(event.currentTarget.value);
    if (!result.success) {
      return;
    }
    setFrom(result.data);
  }, []);

  const onToChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const Schema = z.coerce.date().or(z.literal(''));
    const result = Schema.safeParse(event.currentTarget.value);
    if (!result.success) {
      return;
    }
    setTo(result.data);
  }, []);

  const events = useMemo(() => {
    const filteredEvents = initEvents.filter((event) => {
      const conditions = [true];
      if (userId) {
        conditions.push(userId === event.user.id);
      }
      if (kind) {
        conditions.push(kind === event.kind);
      }
      if (table) {
        conditions.push(table === event.table);
      }
      if (from) {
        conditions.push(dayjs(event.createdAt).isAfter(from));
      }
      if (to) {
        conditions.push(dayjs(event.createdAt).isBefore(to));
      }
      return conditions.every((condition) => condition);
    });
    return filteredEvents.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [initEvents, userId, kind, table, from, to]);

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <CenteredView className="gap-6 px-2">
          <Card className="grid grid-cols-1 divide-x sm:grid-cols-2 md:grid-cols-5">
            <div className="flex flex-col items-stretch justify-center p-2">
              <Select
                name="userId"
                label="Filter By User"
                onChange={onUserIdChange}
                defaultValue={userId}
              >
                <option value={0}>All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col items-stretch justify-center p-2">
              <Select
                name="kind"
                label="Filter By Activity Type"
                defaultValue={kind}
                onChange={onKindChange}
              >
                <option value={''}>All Activity</option>
                {EVENT_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col items-stretch justify-center p-2">
              <Select
                name="table"
                label="Filter By Table"
                defaultValue={table}
                onChange={onTableChange}
              >
                <option value={''}>All Tables</option>
                {TABLES.map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col items-stretch justify-center p-2">
              <TextField
                name="from"
                type="datetime-local"
                label="From this date and time"
                defaultValue={
                  from ? dayjs(from).format(DATE_INPUT_FORMAT + ' hh:mm') : ''
                }
                onChange={onFromChange}
              />
            </div>
            <div className="flex flex-col items-stretch justify-center p-2">
              <TextField
                name="to"
                type="datetime-local"
                label="To this date and time"
                defaultValue={to ? dayjs(to).format(DATE_INPUT_FORMAT) : ''}
                onChange={onToChange}
              />
            </div>
          </Card>
          <Card>
            <div className="flex flex-row items-center justify-start px-4 py-2">
              <h2 className="text-lg font-semibold">Audit Trail</h2>
            </div>
            <div className="flex flex-col items-stretch justify-center p-2">
              {!events.length && (
                <div className="flex flex-col items-center justify-center px-2 py-6">
                  <span className="text-sm font-light text-zinc-400">
                    No events found
                  </span>
                </div>
              )}
              {!!events.length && (
                <table className="table-auto border-collapse text-left">
                  <thead className="divide-y">
                    <tr className="border-b border-b-zinc-100">
                      <th className="w-[15%] p-2">
                        <span className="text-sm font-semibold">
                          Date & Time
                        </span>
                      </th>
                      <th className="w-[15%] p-2">
                        <span className="text-sm font-semibold">User</span>
                      </th>
                      <th className="w-[10%] p-2">
                        <span className="text-sm font-semibold">Activity</span>
                      </th>
                      <th className="w-[10%] p-2">
                        <span className="text-sm font-semibold">Table</span>
                      </th>
                      <th className="w-[50%] p-2">
                        <span className="text-sm font-semibold">Details</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {events.map((event, index) => (
                      <tr
                        key={index}
                        className={twMerge('border-t border-t-zinc-100')}
                      >
                        <td className="px-2 py-3">
                          <span className="font-light text-zinc-600">
                            {dayjs(event.createdAt).format('YYYY-MM-DD hh:mm')}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <span className="font-light text-zinc-600">
                            {event.user.username}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <span className="font-light text-zinc-600">
                            {event.kind}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <span className="font-light text-zinc-600">
                            {event.table}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <EventChips data={event} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </CenteredView>
      </div>
      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}

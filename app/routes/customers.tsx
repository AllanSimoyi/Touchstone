import type { LoaderArgs } from '@remix-run/node';
import type { ChangeEvent } from 'react';
import type {
  LayoutOption,
  SortByOption,
  SortOrderOption,
} from '~/models/customers';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

import { RouteErrorBoundary } from '~/components/Boundaries';
import { Card } from '~/components/Card';
import { CenteredView } from '~/components/CenteredView';
import CustomersLayout from '~/components/CustomersLayout';
import { DebouncedSearch } from '~/components/DebouncedSearch';
import { Footer } from '~/components/Footer';
import { SearchTermContextProvider } from '~/components/SearchTermContextProvider';
import { Select } from '~/components/Select';
import { Toolbar } from '~/components/Toolbar';
import { prisma } from '~/db.server';
import { RecordIdSchema, getQueryParams } from '~/models/core.validations';
import {
  LayoutOptionSchema,
  SortByOptionSchema,
  SortOrderOptionSchema,
  layoutOptions,
  sortByOptions,
  sortOrderOptions,
} from '~/models/customers';
import { showToast } from '~/models/toast';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);

  const message = getQueryParams(request.url, ['message']).message;

  const [customers, areas] = await Promise.all([
    prisma.account.findMany({
      select: {
        id: true,
        accountNumber: true,
        companyName: true,
        accountantName: true,
        accountantEmail: true,
        license: { select: { identifier: true } },
        area: { select: { id: true, identifier: true } },
      },
    }),
    prisma.area.findMany({
      select: { id: true, identifier: true },
    }),
  ]);

  return json({ customers, areas, message });
};

export default function CustomersPage() {
  const user = useUser();
  const { customers, areas, message } = useLoaderData<typeof loader>();

  const [layout, setLayout] = useState<LayoutOption>(layoutOptions[0]);
  const [areaId, setAreaId] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortByOption>(sortByOptions[0]);
  const [sortOrder, setSortOrder] = useState<SortOrderOption>(
    sortOrderOptions[0]
  );
  const [searchTerms, setSearchTerms] = useState('');

  useEffect(() => {
    if (message) {
      showToast('success', message);
    }
  }, [message]);

  const onLayoutChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const result = LayoutOptionSchema.safeParse(event.currentTarget.value);
      if (!result.success) {
        return;
      }
      setLayout(result.data);
    },
    []
  );

  const onAreaChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const result = z.coerce
      .number()
      .int()
      .or(RecordIdSchema)
      .safeParse(event.currentTarget.value);
    if (!result.success) {
      return;
    }
    setAreaId(result.data);
  }, []);

  const onSortByChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const result = SortByOptionSchema.safeParse(event.currentTarget.value);
      if (!result.success) {
        return;
      }
      setSortBy(result.data);
    },
    []
  );

  const onSortOrderChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const result = SortOrderOptionSchema.safeParse(event.currentTarget.value);
      if (!result.success) {
        return;
      }
      setSortOrder(result.data);
    },
    []
  );

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <CenteredView className="gap-6 px-2">
          <Card className="grid grid-cols-1 divide-x sm:grid-cols-2 md:grid-cols-5">
            <div className="flex flex-col items-stretch justify-center p-2">
              <Select
                isRow={false}
                name="layout"
                label="Layout"
                onChange={onLayoutChange}
                defaultValue={layout}
              >
                {layoutOptions.map((layoutOption) => (
                  <option key={layoutOption} value={layoutOption}>
                    {layoutOption}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col items-stretch justify-center p-2">
              <Select
                isRow={false}
                name="areaId"
                label="Filter By Area"
                defaultValue={areaId}
                onChange={onAreaChange}
              >
                <option value={0}>All Areas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.identifier}
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
                {sortByOptions.map((sortOption) => (
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
                {sortOrderOptions.map((sortOrder) => (
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
            <CustomersLayout
              areaId={areaId}
              layout={layout}
              sortBy={sortBy}
              sortOrder={sortOrder}
              searchTerms={searchTerms}
              customers={customers}
            />
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

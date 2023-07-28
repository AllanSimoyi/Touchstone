import type { LoaderArgs } from '@remix-run/node';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { AddEditAreas } from '~/components/AddEditAreas';
import { RouteErrorBoundary } from '~/components/Boundaries';
import { CenteredView } from '~/components/CenteredView';
import { Footer } from '~/components/Footer';
import { Toolbar } from '~/components/Toolbar';
import { prisma } from '~/db.server';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  const records = await Promise.all([
    prisma.area.findMany({
      select: { id: true, identifier: true },
      orderBy: { identifier: 'asc' },
    }),
    prisma.city.findMany({
      select: { id: true, identifier: true },
      orderBy: { identifier: 'asc' },
    }),
    prisma.group.findMany({
      select: { id: true, identifier: true },
      orderBy: { identifier: 'asc' },
    }),
    prisma.license
      .findMany({ select: { id: true, identifier: true, basicUsd: true } })
      .then((licenses) =>
        licenses.map((license) => ({
          ...license,
          basicUsd: license.basicUsd.toNumber(),
        }))
      ),
    prisma.licenseDetail.findMany({
      select: { id: true, identifier: true },
      orderBy: { identifier: 'asc' },
    }),
    prisma.sector.findMany({
      select: { id: true, identifier: true },
      orderBy: { identifier: 'asc' },
    }),
    prisma.status.findMany({
      select: { id: true, identifier: true },
      orderBy: { identifier: 'asc' },
    }),
  ]);
  const [areas, cities, groups, licenses, licenseDetails, sectors, statuses] =
    records;

  return json({
    areas,
    cities,
    groups,
    licenses,
    licenseDetails,
    sectors,
    statuses,
  });
}

export default function PickListsPage() {
  const user = useUser();
  const { areas } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <CenteredView className="gap-6 px-2">
          <div className="flex flex-col items-start justify-center pt-2">
            <span className="text-base font-semibold">Pick Lists</span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AddEditAreas
              items={areas.map((area) => ({ ...area, name: area.identifier }))}
            />
          </div>
        </CenteredView>
      </div>
      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}

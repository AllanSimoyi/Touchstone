import type { LoaderArgs } from '@remix-run/node';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { AddEditAreas } from '~/components/AddEditAreas';
import { AddEditCities } from '~/components/AddEditCities';
import { AddEditGroups } from '~/components/AddEditGroups';
import { AddEditLicenses } from '~/components/AddEditLicense';
import { AddEditLicenseDetails } from '~/components/AddEditLicenseDetail';
import { AddEditSectors } from '~/components/AddEditSectors';
import { AddEditStatuses } from '~/components/AddEditStatuses';
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
  const { areas, groups, cities, licenses, licenseDetails, sectors, statuses } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <CenteredView className="gap-6 px-2">
          <div className="flex flex-col items-start justify-center pt-2">
            <span className="text-lg font-semibold">Pick Lists</span>
          </div>
          {/* <div className="masonry sm:masonry-sm md:masonry-md gap-6"> */}
          {/* <div className="break-inside flex flex-col items-stretch pb-6"> */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AddEditAreas
              items={areas.map((area) => ({
                ...area,
                name: area.identifier,
              }))}
            />
            <AddEditLicenses items={licenses} />
            <AddEditGroups
              items={groups.map((group) => ({
                ...group,
                name: group.identifier,
              }))}
            />
            <AddEditStatuses
              items={statuses.map((status) => ({
                ...status,
                name: status.identifier,
              }))}
            />
            <AddEditSectors
              items={sectors.map((sector) => ({
                ...sector,
                name: sector.identifier,
              }))}
            />
            <AddEditCities
              items={cities.map((city) => ({
                ...city,
                name: city.identifier,
              }))}
            />
            {/* <div className="grid gap-6">
              <AddEditAreas
                items={areas.map((area) => ({
                  ...area,
                  name: area.identifier,
                }))}
              />
              <AddEditCities
                items={cities.map((city) => ({
                  ...city,
                  name: city.identifier,
                }))}
              />
            </div>
            <div className="grid gap-6">
              <AddEditLicenses items={licenses} />
              <AddEditGroups
                items={groups.map((group) => ({
                  ...group,
                  name: group.identifier,
                }))}
              />
            </div>
            <div className="grid gap-6">
              <AddEditStatuses
                items={statuses.map((status) => ({
                  ...status,
                  name: status.identifier,
                }))}
              />
              <AddEditSectors
                items={sectors.map((sector) => ({
                  ...sector,
                  name: sector.identifier,
                }))}
              />
            </div>
            <div className="col-span-3 flex flex-col items-stretch">
              <AddEditLicenseDetails className="grow" items={licenseDetails} />
            </div> */}
          </div>
          <div className="flex flex-col items-stretch pb-6">
            <AddEditLicenseDetails className="grow" items={licenseDetails} />
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

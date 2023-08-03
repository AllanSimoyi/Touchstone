import type { LoaderArgs } from '@remix-run/node';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';

import { Card } from '~/components/Card';
import { CardHeader } from '~/components/CardHeader';
import { CenteredView } from '~/components/CenteredView';
import { CustomBarChart } from '~/components/CustomBarChart';
import { DashboardCard } from '~/components/DashboardCard';
import { Footer } from '~/components/Footer';
import { Toolbar } from '~/components/Toolbar';
import { prisma } from '~/db.server';
import { AppLinks } from '~/models/links';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

const MAX_CHART_ITEMS = 6;

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  const [areas, groups, licenses, sectors] = await Promise.all([
    prisma.area
      .findMany({
        select: {
          identifier: true,
          _count: { select: { accounts: true } },
        },
      })
      .then((areas) =>
        areas
          .sort((a, b) => b._count.accounts - a._count.accounts)
          .splice(0, MAX_CHART_ITEMS)
      ),
    prisma.group
      .findMany({
        select: {
          identifier: true,
          _count: { select: { accounts: true } },
        },
      })
      .then((groups) =>
        groups
          .sort((a, b) => b._count.accounts - a._count.accounts)
          .splice(0, MAX_CHART_ITEMS)
      ),
    prisma.license
      .findMany({
        select: {
          identifier: true,
          _count: { select: { accounts: true } },
        },
      })
      .then((licenses) =>
        licenses
          .sort((a, b) => b._count.accounts - a._count.accounts)
          .splice(0, MAX_CHART_ITEMS)
      ),
    prisma.sector
      .findMany({
        select: {
          identifier: true,
          _count: { select: { accounts: true } },
        },
      })
      .then((sectors) =>
        sectors
          .sort((a, b) => b._count.accounts - a._count.accounts)
          .splice(0, MAX_CHART_ITEMS)
      ),
  ]);

  return json({ areas, groups, licenses, sectors });
}

export default function Index() {
  const user = useUser();
  const { areas, groups, licenses, sectors } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <CenteredView className="px-2">
          <div className="flex flex-col items-stretch gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <DashboardCard
                title="Customers"
                links={[
                  { caption: 'View Customers', to: AppLinks.Customers },
                  { caption: 'Add Customer', to: AppLinks.AddCustomer },
                ]}
              />
              <DashboardCard
                title="Users"
                links={[
                  { caption: 'View Users', to: AppLinks.Users },
                  { caption: 'Add User', to: AppLinks.AddUser },
                ]}
              />
              <DashboardCard
                title="Migration"
                links={[
                  { caption: 'Import Records', to: AppLinks.Import },
                  { caption: 'Export Records', to: AppLinks.Backup },
                ]}
              />
              <DashboardCard
                title="Audit Trail"
                links={[
                  { caption: 'View Timeline', to: AppLinks.AuditTrail },
                  {
                    caption: "Today's Activity",
                    to: `${AppLinks.AuditTrail}?minDate=${dayjs().startOf(
                      'day'
                    )}`,
                  },
                ]}
              />
              <Card className="flex flex-col items-stretch justify-center">
                <CardHeader>Top Areas</CardHeader>
                <CustomBarChart
                  items={areas.map((area) => ({
                    key: area.identifier,
                    value: area._count.accounts,
                  }))}
                />
              </Card>
              <Card className="flex flex-col items-stretch justify-center">
                <CardHeader>Top Groups</CardHeader>
                <CustomBarChart
                  items={groups.map((group) => ({
                    key: group.identifier,
                    value: group._count.accounts,
                  }))}
                />
              </Card>
              <Card className="flex flex-col items-stretch justify-center">
                <CardHeader>Top Licenses</CardHeader>
                <CustomBarChart
                  items={licenses.map((license) => ({
                    key: license.identifier,
                    value: license._count.accounts,
                  }))}
                />
              </Card>
              <Card className="flex flex-col items-stretch justify-center">
                <CardHeader>Top Sectors</CardHeader>
                <CustomBarChart
                  items={sectors.map((sector) => ({
                    key: sector.identifier,
                    value: sector._count.accounts,
                  }))}
                />
              </Card>
            </div>
          </div>
        </CenteredView>
      </div>
      <Footer />
    </div>
  );
}

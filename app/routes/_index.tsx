import type { LoaderArgs } from '@remix-run/node';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';

import { CenteredView } from '~/components/CenteredView';
import { DashboardCard } from '~/components/DashboardCard';
import { Footer } from '~/components/Footer';
import { Toolbar } from '~/components/Toolbar';
import { AppLinks } from '~/models/links';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  return json({});
}

export default function Index() {
  const user = useUser();
  useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <div className="flex grow flex-col items-stretch py-12">
        <CenteredView className="px-2">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
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
          </div>
        </CenteredView>
      </div>
      <Footer />
    </div>
  );
}

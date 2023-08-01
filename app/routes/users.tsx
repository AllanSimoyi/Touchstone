import type { LoaderArgs } from '@remix-run/node';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { RouteErrorBoundary } from '~/components/Boundaries';
import { Card } from '~/components/Card';
import { CenteredView } from '~/components/CenteredView';
import { Footer } from '~/components/Footer';
import { PrimaryButtonLink } from '~/components/PrimaryButton';
import { Toolbar } from '~/components/Toolbar';
import { UserTableRow } from '~/components/UserTableRow';
import { prisma } from '~/db.server';
import { AppLinks } from '~/models/links';
import { filterByValidAccessLevel } from '~/models/user.validations';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export const loader = async ({ request }: LoaderArgs) => {
  const currentUserId = await requireUserId(request);

  const users = await prisma.user
    .findMany({
      where: { id: { not: currentUserId } },
      select: { id: true, username: true, accessLevel: true },
    })
    .then((users) => filterByValidAccessLevel(users));

  return json({ users });
};

export default function UsersPage() {
  const user = useUser();
  const { users } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <CenteredView className="gap-6 px-2">
          <div className="flex flex-col items-center">
            <Card className="min-w-[40%]">
              <div className="flex flex-row items-center justify-start border-b border-b-zinc-200 px-4 py-2">
                <h2 className="text-lg font-semibold">Users</h2>
                <div className="grow" />
                <PrimaryButtonLink to={AppLinks.AddUser}>
                  New User
                </PrimaryButtonLink>
              </div>
              <div className="flex flex-col items-stretch justify-center p-2">
                {!!users.length && (
                  <table className="table-auto border-collapse text-left">
                    <thead className="divide-y">
                      <tr className="border-b border-b-zinc-100">
                        <th className="p-2">
                          <span className="text-lg font-semibold">
                            Access Level
                          </span>
                        </th>
                        <th className="p-2">
                          <span className="text-lg font-semibold">
                            Username
                          </span>
                        </th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="text-base">
                      {users.map((user) => (
                        <UserTableRow key={user.id} {...user} />
                      ))}
                    </tbody>
                  </table>
                )}
                {!users.length && (
                  <div className="flex flex-col items-center justify-center px-2 py-6">
                    <span className="text-base font-light text-zinc-400">
                      No users found
                    </span>
                  </div>
                )}
              </div>
            </Card>
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

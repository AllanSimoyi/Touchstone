import type { LoaderArgs } from '@remix-run/node';

import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ChevronRight } from 'tabler-icons-react';

import { Card } from '~/components/Card';
import { CardHeader } from '~/components/CardHeader';
import { CenteredView } from '~/components/CenteredView';
import { CustomBarChart } from '~/components/CustomBarChart';
import { Footer } from '~/components/Footer';
import { Toolbar } from '~/components/Toolbar';
import { UnderLineOnHover } from '~/components/UnderLineOnHover';
import { prisma } from '~/db.server';
import { AppLinks } from '~/models/links';
import { logParseError } from '~/models/logger.server';
import {
  SUPPORT_JOB_STATUSES,
  SUPPORT_JOB_TYPES,
  StrSupportJobTypeSchema,
} from '~/models/support-jobs';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

const MAX_CHART_ITEMS = 6;

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  const jobs = await prisma.supportJob
    .findMany({
      select: {
        supportType: true,
        supportPerson: true,
        status: true,
        account: { select: { id: true, companyName: true } },
      },
    })
    .then((jobs) => {
      return jobs
        .map(({ supportType, ...job }) => {
          const result = StrSupportJobTypeSchema.safeParse(supportType);
          if (!result.success) {
            logParseError(request, result.error, job);
            return undefined;
          }
          return { ...job, supportTypes: result.data };
        })
        .filter(Boolean);
    });

  type ChartItem = { key: string; value: number };

  const supportPeople = jobs
    .reduce((acc, job) => {
      const alreadyAdded = acc.some((stat) => stat.key === job.supportPerson);
      if (!alreadyAdded) {
        return [...acc, { key: job.supportPerson, value: 1 }];
      }
      return acc.map((stat) => {
        if (stat.key !== job.supportPerson) {
          return stat;
        }
        return { ...stat, value: stat.value + 1 };
      });
    }, [] as ChartItem[])
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_CHART_ITEMS);

  const companies = jobs
    .reduce((acc, job) => {
      const alreadyAdded = acc.some(
        (stat) => stat.key === job.account.companyName
      );
      if (!alreadyAdded) {
        return [...acc, { key: job.account.companyName, value: 1 }];
      }
      return acc.map((stat) => {
        if (stat.key !== job.account.companyName) {
          return stat;
        }
        return { ...stat, value: stat.value + 1 };
      });
    }, [] as ChartItem[])
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_CHART_ITEMS);

  const statuses = SUPPORT_JOB_STATUSES.map((status) => {
    const value = jobs.filter((job) => job.status === status).length;
    return { key: status, value };
  })
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_CHART_ITEMS);

  const typesOfWork = SUPPORT_JOB_TYPES.map((t) => {
    const value = jobs.filter((job) => job.supportTypes.includes(t)).length;
    return { key: t, value };
  })
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_CHART_ITEMS);

  return json({ supportPeople, companies, statuses, typesOfWork });
}

export default function Index() {
  const user = useUser();
  const { supportPeople, companies, statuses, typesOfWork } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <CenteredView className="px-2">
          <div className="flex flex-col items-stretch gap-6">
            <div className="flex flex-col items-stretch">
              <h2 className="flex flex-row items-stretch gap-2 text-2xl font-semibold">
                <Link to={AppLinks.SupportJobs}>
                  <UnderLineOnHover>
                    <span className="text-zinc-400 transition-all duration-150 hover:text-zinc-800">
                      Support Jobs
                    </span>
                  </UnderLineOnHover>
                </Link>
                <div className="flex flex-col items-center justify-center">
                  <ChevronRight className="text-zinc-400" />
                </div>
                <span className="text-zinc-800">Analytics</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="flex flex-col items-stretch justify-center">
                <CardHeader>Types Of Work</CardHeader>
                <CustomBarChart
                  identifier="support job(s)"
                  items={typesOfWork}
                />
              </Card>
              <Card className="flex flex-col items-stretch justify-center">
                <CardHeader>Support Personnel</CardHeader>
                <CustomBarChart
                  identifier="support job(s)"
                  items={supportPeople}
                />
              </Card>
              <Card className="flex flex-col items-stretch justify-center">
                <CardHeader>Companies</CardHeader>
                <CustomBarChart identifier="support job(s)" items={companies} />
              </Card>
              <Card className="flex flex-col items-stretch justify-center">
                <CardHeader>Job Status</CardHeader>
                <CustomBarChart identifier="support job(s)" items={statuses} />
              </Card>
            </div>
          </div>
        </CenteredView>
      </div>
      <Footer />
    </div>
  );
}

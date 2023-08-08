export const a = 'zxc'; // import { prisma } from './db.server';

// (async () => {
//   const jobs = await prisma.supportJob.findMany({
//     select: {
//       id: true,
//       account: { select: { id: true, companyName: true } },
//       company: true,
//     },
//   });

//   for (const job of jobs) {
//     console.log(
//       'Job',
//       job.id,
//       'company',
//       job.company,
//       'account',
//       job.account?.id,
//       '-',
//       job.account?.companyName
//     );
//   }
// })();

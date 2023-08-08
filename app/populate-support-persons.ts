import { prisma } from './db.server';

(async () => {
  const jobs = await prisma.supportJob.findMany({
    select: { id: true, userId: true },
  });
  for (const job of jobs) {
    await prisma.supportJob.update({
      where: { id: job.id },
      data: { supportPersonId: job.userId },
    });
    console.log('Updated job', job.id);
  }
})();

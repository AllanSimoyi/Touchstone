export const a = 'zxc'; // import { faker } from '@faker-js/faker';

// import { prisma } from './db.server';

// const PHONE_NUMBER_FORMAT = '+263#########';

// (async () => {
//   const [{ id: groupId }] = await prisma.group.findMany({
//     select: { id: true },
//   });
//   const [{ id: areaId }] = await prisma.area.findMany({ select: { id: true } });
//   const [{ id: sectorId }] = await prisma.sector.findMany({
//     select: { id: true },
//   });
//   const [{ id: statusId }] = await prisma.status.findMany({
//     select: { id: true },
//   });
//   const [{ id: licenseId }] = await prisma.license.findMany({
//     select: { id: true },
//   });
//   const [{ id: licenseDetailId }] = await prisma.licenseDetail.findMany({
//     select: { id: true },
//   });
//   const [{ id: cityId }] = await prisma.city.findMany({ select: { id: true } });

//   const [jobs, accounts] = await Promise.all([
//     prisma.supportJob.findMany({
//       select: { id: true, company: true },
//     }),
//     prisma.account.findMany({
//       select: { id: true, companyName: true },
//     }),
//   ]);

//   for (const job of jobs) {
//     const account = accounts.find((a) => a.companyName === job.company);
//     if (account) {
//       await prisma.supportJob.update({
//         where: { id: job.id },
//         data: { accountId: account.id },
//       });
//       console.log(
//         'Found matching account, updated account id',
//         account.id,
//         'for job',
//         job.id
//       );
//       continue;
//     }
//     const { id: newAccountId } = await prisma.$transaction(async (tx) => {
//       const account = await tx.account.create({
//         select: { id: true },
//         data: {
//           accountNumber: faker.finance.accountNumber(),
//           companyName: job.company,
//           tradingAs: faker.company.name(),
//           formerly: faker.company.name(),
//           groupId,
//           areaId,
//           sectorId,
//           vatNumber: faker.finance.accountNumber(),
//           otherNames: faker.person.fullName(),
//           description: faker.company.buzzPhrase(),
//           actual: faker.number.int(5000),
//           reason: faker.lorem.sentence(5),
//           statusId,
//           contractNumber: faker.finance.accountNumber(5),
//           dateOfContract: faker.date.past(),
//           licenseId,
//           licenseDetailId,
//           addedPercentage: faker.number.int(50),
//           gross: faker.finance.amount({ min: 500_000, max: 1_000_000, dec: 2 }),
//           net: faker.finance.amount({ min: 1, max: 500_000, dec: 2 }),
//           vat: faker.number.int(50),
//           comment: faker.lorem.paragraph(2),
//           ceoName: faker.person.fullName(),
//           ceoEmail: faker.internet.email(),
//           ceoPhone: faker.phone.number(PHONE_NUMBER_FORMAT),
//           ceoFax: faker.finance.accountNumber(),
//           accountantName: faker.person.fullName(),
//           accountantEmail: faker.internet.email(),
//           boxCityId: cityId,
//           boxNumber: faker.finance.accountNumber(),
//           boxArea: faker.location.county(),
//           physicalAddress: faker.location.streetAddress(),
//           telephoneNumber: faker.phone.number(PHONE_NUMBER_FORMAT),
//           faxNumber: faker.finance.accountNumber(),
//           cellphoneNumber: faker.phone.number(PHONE_NUMBER_FORMAT),
//           deliveryCityId: cityId,
//           deliveryAddress: faker.location.streetAddress(),
//           deliverySuburb: faker.location.county(),
//         },
//       });
//       await tx.database.create({
//         data: { accountId: account.id, databaseName: faker.lorem.word() },
//       });
//       await tx.operator.create({
//         data: {
//           accountId: account.id,
//           operatorName: faker.person.fullName(),
//           operatorEmail: faker.internet.email(),
//         },
//       });
//       console.log('Created new account', account.id);
//       return account;
//     });
//     await prisma.supportJob.update({
//       where: { id: job.id },
//       data: { accountId: newAccountId },
//     });
//     console.log(
//       'Updated support job',
//       job.id,
//       'with new account',
//       newAccountId
//     );
//   }
// })();

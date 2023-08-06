import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { EventKind } from '~/models/events';
import { SUPPORT_JOB_STATUSES, SUPPORT_JOB_TYPES } from '~/models/support-jobs';

const prisma = new PrismaClient();

const PHONE_NUMBER_FORMAT = '+263#########';

async function seed() {
  await prisma.account.deleteMany();
  await prisma.accountEvent.deleteMany();

  await prisma.area.deleteMany();
  await prisma.areaEvent.deleteMany();

  await prisma.city.deleteMany();
  await prisma.cityEvent.deleteMany();

  await prisma.database.deleteMany();
  await prisma.databaseEvent.deleteMany();

  await prisma.group.deleteMany();
  await prisma.groupEvent.deleteMany();

  await prisma.licenseDetail.deleteMany();
  await prisma.licenseDetailEvent.deleteMany();

  await prisma.license.deleteMany();
  await prisma.licenseEvent.deleteMany();

  await prisma.operator.deleteMany();
  await prisma.operatorEvent.deleteMany();

  await prisma.sector.deleteMany();
  await prisma.sectorEvent.deleteMany();

  await prisma.status.deleteMany();
  await prisma.statusEvent.deleteMany();

  await prisma.supportJob.deleteMany();
  await prisma.supportJobEvent.deleteMany();

  await prisma.user.deleteMany();
  await prisma.userEvent.deleteMany();

  const hashedPassword = await bcrypt.hash('default@8901', 10);

  const groupIds = await ['AGT', 'ANZ', 'APG'].reduce(async (acc, el) => {
    const ids = await acc;
    const { id } = await prisma.group.create({
      data: { identifier: el },
      select: { id: true },
    });
    return [...ids, id];
  }, Promise.resolve([] as number[]));
  const [groupId] = groupIds;

  const areaIds = await ['BOT', 'BUR', 'HAR'].reduce(async (acc, el) => {
    const ids = await acc;
    const { id } = await prisma.area.create({
      data: { identifier: el },
      select: { id: true },
    });
    return [...ids, id];
  }, Promise.resolve([] as number[]));
  const [areaId] = areaIds;

  const sectorIds = await ['ADVERTISING', 'AGRICULTURE', 'CHEMICAL'].reduce(
    async (acc, el) => {
      const ids = await acc;
      const { id } = await prisma.sector.create({
        data: { identifier: el },
        select: { id: true },
      });
      return [...ids, id];
    },
    Promise.resolve([] as number[])
  );
  const [sectorId] = sectorIds;

  const statusIds = await ['Merged', 'S', 'X'].reduce(async (acc, el) => {
    const ids = await acc;
    const { id } = await prisma.status.create({
      data: { identifier: el },
      select: { id: true },
    });
    return [...ids, id];
  }, Promise.resolve([] as number[]));
  const [statusId] = statusIds;

  const licenseIds = await (
    [
      ['100N', 210],
      ['10N', 85],
      ['10P', 90],
    ] as const
  ).reduce(async (acc, [identifier, basicUsd]) => {
    const ids = await acc;
    const { id } = await prisma.license.create({
      data: { identifier, basicUsd },
      select: { id: true },
    });
    return [...ids, id];
  }, Promise.resolve([] as number[]));
  const [licenseId] = licenseIds;

  const licenseDetailIds = await [
    'BUREAU FOR UP TO 10 EMPLOYEES',
    'BUREAU FOR UP TO 20 EMPLOYEES',
    'BUREAU FOR UP TO 200 EMPLOYEES',
  ].reduce(async (acc, identifier) => {
    const ids = await acc;
    const { id } = await prisma.licenseDetail.create({
      data: { identifier },
      select: { id: true },
    });
    return [...ids, id];
  }, Promise.resolve([] as number[]));
  const [licenseDetailId] = licenseDetailIds;

  const cityIds = await [...Array(10).keys()].reduce(async (acc, _) => {
    const ids = await acc;
    const { id } = await prisma.city.create({
      data: { identifier: faker.location.city() },
      select: { id: true },
    });
    return [...ids, id];
  }, Promise.resolve([] as number[]));
  const [cityId] = cityIds;

  const accountIds = await [...Array(10).keys()].reduce(async (acc, _) => {
    const ids = await acc;
    const { id } = await prisma.account.create({
      data: {
        accountNumber: faker.finance.accountNumber(),
        companyName: faker.company.name(),
        tradingAs: faker.company.name(),
        formerly: faker.company.name(),
        groupId,
        areaId,
        sectorId,
        vatNumber: faker.finance.accountNumber(),
        otherNames: faker.person.fullName(),
        description: faker.company.buzzPhrase(),
        actual: faker.number.int(5000),
        reason: faker.lorem.sentence(5),
        statusId,
        contractNumber: faker.finance.accountNumber(5),
        dateOfContract: faker.date.past(),
        licenseId,
        licenseDetailId,
        addedPercentage: faker.number.int(50),
        gross: faker.finance.amount({ min: 500_000, max: 1_000_000, dec: 2 }),
        net: faker.finance.amount({ min: 1, max: 500_000, dec: 2 }),
        vat: faker.number.int(50),
        comment: faker.lorem.paragraph(2),
        ceoName: faker.person.fullName(),
        ceoEmail: faker.internet.email(),
        ceoPhone: faker.phone.number(PHONE_NUMBER_FORMAT),
        ceoFax: faker.finance.accountNumber(),
        accountantName: faker.person.fullName(),
        accountantEmail: faker.internet.email(),
        boxCityId: cityId,
        boxNumber: faker.finance.accountNumber(),
        boxArea: faker.location.county(),
        physicalAddress: faker.location.streetAddress(),
        telephoneNumber: faker.phone.number(PHONE_NUMBER_FORMAT),
        faxNumber: faker.finance.accountNumber(),
        cellphoneNumber: faker.phone.number(PHONE_NUMBER_FORMAT),
        deliveryCityId: cityId,
        deliveryAddress: faker.location.streetAddress(),
        deliverySuburb: faker.location.county(),
        databases: {
          create: {
            databaseName: faker.lorem.word(),
          },
        },
        operators: {
          create: {
            operatorName: faker.person.fullName(),
            operatorEmail: faker.internet.email(),
          },
        },
      },
    });
    return [...ids, id];
  }, Promise.resolve([] as number[]));

  const accessLevels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'];

  const users = await Promise.all(
    accessLevels.map((accessLevel) => {
      return prisma.user.create({
        data: {
          username: accessLevel,
          password: hashedPassword,
          accessLevel,
        },
      });
    })
  );
  const [{ id: userId }] = users;

  function getSupportJobStatus(index: number) {
    if (index < 3) {
      return SUPPORT_JOB_STATUSES[index];
    }
    return SUPPORT_JOB_STATUSES[2];
  }

  for (const user of users) {
    await prisma.supportJob.createMany({
      data: accountIds.slice(0, 10).map((accountId, index) => ({
        accountId,
        clientStaffName: faker.person.fullName(),
        supportPerson: faker.person.fullName(),
        supportType: JSON.stringify([
          SUPPORT_JOB_TYPES[0],
          SUPPORT_JOB_TYPES[1],
        ]),
        status: getSupportJobStatus(index),
        enquiry: faker.lorem.sentence(7),
        actionTaken: faker.lorem.paragraph(2),
        charge: faker.finance.amount(),
        date: faker.date.past(),
        userId: user.id,
      })),
    });
  }

  for (const accountId of accountIds) {
    await Promise.all([
      prisma.accountEvent.create({
        data: {
          accountId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Create,
        },
      }),
      prisma.accountEvent.create({
        data: {
          accountId,
          userId,
          details: JSON.stringify({
            field1: { from: faker.lorem.word(), to: faker.lorem.word() },
            field2: { from: faker.number.int(50), to: faker.number.int(100) },
            field3: {
              from: faker.person.fullName(),
              to: faker.person.fullName(),
            },
          }),
          kind: EventKind.Update,
        },
      }),
      prisma.accountEvent.create({
        data: {
          accountId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Delete,
        },
      }),
    ]);
  }

  for (const areaId of areaIds) {
    await Promise.all([
      prisma.areaEvent.create({
        data: {
          areaId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Create,
        },
      }),
      prisma.areaEvent.create({
        data: {
          areaId,
          userId,
          details: JSON.stringify({
            field1: { from: faker.lorem.word(), to: faker.lorem.word() },
            field2: { from: faker.number.int(50), to: faker.number.int(100) },
            field3: {
              from: faker.person.fullName(),
              to: faker.person.fullName(),
            },
          }),
          kind: EventKind.Update,
        },
      }),
      prisma.areaEvent.create({
        data: {
          areaId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Delete,
        },
      }),
    ]);
  }

  for (const cityId of cityIds) {
    await Promise.all([
      prisma.cityEvent.create({
        data: {
          cityId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Create,
        },
      }),
      prisma.cityEvent.create({
        data: {
          cityId,
          userId,
          details: JSON.stringify({
            field1: { from: faker.lorem.word(), to: faker.lorem.word() },
            field2: { from: faker.number.int(50), to: faker.number.int(100) },
            field3: {
              from: faker.person.fullName(),
              to: faker.person.fullName(),
            },
          }),
          kind: EventKind.Update,
        },
      }),
      prisma.cityEvent.create({
        data: {
          cityId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Delete,
        },
      }),
    ]);
  }

  for (const groupId of groupIds) {
    await Promise.all([
      prisma.groupEvent.create({
        data: {
          groupId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Create,
        },
      }),
      prisma.groupEvent.create({
        data: {
          groupId,
          userId,
          details: JSON.stringify({
            field1: { from: faker.lorem.word(), to: faker.lorem.word() },
            field2: { from: faker.number.int(50), to: faker.number.int(100) },
            field3: {
              from: faker.person.fullName(),
              to: faker.person.fullName(),
            },
          }),
          kind: EventKind.Update,
        },
      }),
      prisma.groupEvent.create({
        data: {
          groupId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Delete,
        },
      }),
    ]);
  }

  for (const licenseDetailId of licenseDetailIds) {
    await Promise.all([
      prisma.licenseDetailEvent.create({
        data: {
          licenseDetailId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Create,
        },
      }),
      prisma.licenseDetailEvent.create({
        data: {
          licenseDetailId,
          userId,
          details: JSON.stringify({
            field1: { from: faker.lorem.word(), to: faker.lorem.word() },
            field2: { from: faker.number.int(50), to: faker.number.int(100) },
            field3: {
              from: faker.person.fullName(),
              to: faker.person.fullName(),
            },
          }),
          kind: EventKind.Update,
        },
      }),
      prisma.licenseDetailEvent.create({
        data: {
          licenseDetailId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Delete,
        },
      }),
    ]);
  }

  for (const licenseId of licenseIds) {
    await Promise.all([
      prisma.licenseEvent.create({
        data: {
          licenseId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Create,
        },
      }),
      prisma.licenseEvent.create({
        data: {
          licenseId,
          userId,
          details: JSON.stringify({
            field1: { from: faker.lorem.word(), to: faker.lorem.word() },
            field2: { from: faker.number.int(50), to: faker.number.int(100) },
            field3: {
              from: faker.person.fullName(),
              to: faker.person.fullName(),
            },
          }),
          kind: EventKind.Update,
        },
      }),
      prisma.licenseEvent.create({
        data: {
          licenseId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Delete,
        },
      }),
    ]);
  }

  for (const sectorId of sectorIds) {
    await Promise.all([
      prisma.sectorEvent.create({
        data: {
          sectorId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Create,
        },
      }),
      prisma.sectorEvent.create({
        data: {
          sectorId,
          userId,
          details: JSON.stringify({
            field1: { from: faker.lorem.word(), to: faker.lorem.word() },
            field2: { from: faker.number.int(50), to: faker.number.int(100) },
            field3: {
              from: faker.person.fullName(),
              to: faker.person.fullName(),
            },
          }),
          kind: EventKind.Update,
        },
      }),
      prisma.sectorEvent.create({
        data: {
          sectorId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Delete,
        },
      }),
    ]);
  }

  for (const statusId of statusIds) {
    await Promise.all([
      prisma.statusEvent.create({
        data: {
          statusId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Create,
        },
      }),
      prisma.statusEvent.create({
        data: {
          statusId,
          userId,
          details: JSON.stringify({
            field1: { from: faker.lorem.word(), to: faker.lorem.word() },
            field2: { from: faker.number.int(50), to: faker.number.int(100) },
            field3: {
              from: faker.person.fullName(),
              to: faker.person.fullName(),
            },
          }),
          kind: EventKind.Update,
        },
      }),
      prisma.statusEvent.create({
        data: {
          statusId,
          userId,
          details: JSON.stringify({
            field1: faker.internet.userName(),
            field2: faker.database.engine(),
            field3: faker.airline.seat(),
            field4: faker.company.buzzAdjective(),
            field5: faker.commerce.department(),
          }),
          kind: EventKind.Delete,
        },
      }),
    ]);
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

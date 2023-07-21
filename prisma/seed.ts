import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  await prisma.accountant.deleteMany();
  await prisma.account.deleteMany();
  await prisma.area.deleteMany();
  await prisma.box.deleteMany();
  await prisma.ceo.deleteMany();
  await prisma.city.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.database.deleteMany();
  await prisma.deliveryAddress.deleteMany();
  await prisma.event.deleteMany();
  await prisma.group.deleteMany();
  await prisma.licenseDetail.deleteMany();
  await prisma.license.deleteMany();
  await prisma.operator.deleteMany();
  await prisma.sector.deleteMany();
  await prisma.status.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('default@8901', 10);

  const [groupId] = await ['AGT', 'ANZ', 'APG'].reduce(async (acc, el) => {
    const ids = await acc;
    const { id } = await prisma.group.create({
      data: { identifier: el },
      select: { id: true },
    });
    return [...ids, id];
  }, Promise.resolve([] as number[]));

  const [areaId] = await ['BOT', 'BUR', 'HAR'].reduce(async (acc, el) => {
    const ids = await acc;
    const { id } = await prisma.area.create({
      data: { identifier: el },
      select: { id: true },
    });
    return [...ids, id];
  }, Promise.resolve([] as number[]));

  const [sectorId] = await ['ADVERTISING', 'AGRICULTURE', 'CHEMICAL'].reduce(
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

  const [statusId] = await ['Merged', 'S', 'X'].reduce(async (acc, el) => {
    const ids = await acc;
    const { id } = await prisma.status.create({
      data: { identifier: el },
      select: { id: true },
    });
    return [...ids, id];
  }, Promise.resolve([] as number[]));

  const [licenseId] = await (
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

  const [licenseDetailId] = await [
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

  const [cityId] = await [...Array(10).keys()].reduce(async (acc, _) => {
    const ids = await acc;
    const { id } = await prisma.city.create({
      data: { identifier: faker.location.city() },
      select: { id: true },
    });
    return [...ids, id];
  }, Promise.resolve([] as number[]));

  await [...Array(10).keys()].reduce(async (acc, _) => {
    await acc;
    await prisma.account.create({
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
        ceos: {
          create: {
            ceoName: faker.person.fullName(),
            ceoEmail: faker.internet.email(),
            ceoPhone: faker.phone.number(),
            ceoFax: faker.finance.accountNumber(),
          },
        },
        accountants: {
          create: {
            accountantName: faker.person.fullName(),
            accountantEmail: faker.internet.email(),
          },
        },
        boxes: {
          create: {
            boxCityId: cityId,
            boxNumber: faker.finance.accountNumber(),
            boxArea: faker.location.county(),
          },
        },
        contacts: {
          create: {
            physicalAddress: faker.location.streetAddress(),
            telephoneNumber: faker.phone.number(),
            faxNumber: faker.finance.accountNumber(),
            cellphoneNumber: faker.phone.number(),
          },
        },
        databases: {
          create: {
            databaseName: faker.lorem.word(),
          },
        },
        deliveryAddresses: {
          create: {
            deliveryCityId: cityId,
            deliveryAddress: faker.location.streetAddress(),
            deliverySuburb: faker.location.county(),
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
  }, Promise.resolve());

  const roles = await Promise.all(
    (
      [
        ['Level 1', 'Administrator'],
        ['Level 2', 'Update'],
        ['Level 3', 'Update'],
        ['Level 4', 'Read Only'],
        ['Level 5', 'Read Only'],
      ] as const
    ).map(async ([accessLevel, feature]) => {
      const { id } = await prisma.role.create({
        data: {
          accessLevel,
          feature,
        },
        select: { id: true, accessLevel: true, feature: true },
      });
      return [id, accessLevel, feature] as const;
    })
  );

  await Promise.all(
    roles.map(([roleId, level, feature]) => {
      return prisma.user.create({
        data: {
          username: level,
          password: hashedPassword,
          roleId,
        },
      });
    })
  );

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

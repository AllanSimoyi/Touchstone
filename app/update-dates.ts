import { prisma } from './db.server';

(async () => {
  const accountants = await prisma.accountant.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await accountants.reduce(async (acc, item) => {
    await acc;
    await prisma.accountant.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const accounts = await prisma.account.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await accounts.reduce(async (acc, item) => {
    await acc;
    await prisma.account.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const areas = await prisma.area.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await areas.reduce(async (acc, item) => {
    await acc;
    await prisma.area.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const boxs = await prisma.box.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await boxs.reduce(async (acc, item) => {
    await acc;
    await prisma.box.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const ceos = await prisma.ceo.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await ceos.reduce(async (acc, item) => {
    await acc;
    await prisma.ceo.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const citys = await prisma.city.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await citys.reduce(async (acc, item) => {
    await acc;
    await prisma.city.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const contacts = await prisma.contact.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await contacts.reduce(async (acc, item) => {
    await acc;
    await prisma.contact.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const databases = await prisma.database.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await databases.reduce(async (acc, item) => {
    await acc;
    await prisma.database.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const deliveryAddresss = await prisma.deliveryAddress.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await deliveryAddresss.reduce(async (acc, item) => {
    await acc;
    await prisma.deliveryAddress.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const events = await prisma.event.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await events.reduce(async (acc, item) => {
    await acc;
    await prisma.event.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const groups = await prisma.group.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await groups.reduce(async (acc, item) => {
    await acc;
    await prisma.group.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const licenseDetails = await prisma.licenseDetail.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await licenseDetails.reduce(async (acc, item) => {
    await acc;
    await prisma.licenseDetail.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const licenses = await prisma.license.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await licenses.reduce(async (acc, item) => {
    await acc;
    await prisma.license.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const operators = await prisma.operator.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await operators.reduce(async (acc, item) => {
    await acc;
    await prisma.operator.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const roles = await prisma.role.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await roles.reduce(async (acc, item) => {
    await acc;
    await prisma.role.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const sectors = await prisma.sector.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await sectors.reduce(async (acc, item) => {
    await acc;
    await prisma.sector.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const statuss = await prisma.status.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await statuss.reduce(async (acc, item) => {
    await acc;
    await prisma.status.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const titles = await prisma.title.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await titles.reduce(async (acc, item) => {
    await acc;
    await prisma.title.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  const users = await prisma.user.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await users.reduce(async (acc, item) => {
    await acc;
    await prisma.user.update({
      where: { id: item.id },
      data: {
        createdAt2: new Date(Number(item.createdAt)),
        updatedAt2: new Date(Number(item.updatedAt)),
      },
    });
  }, Promise.resolve());
  console.log('Done');
})();

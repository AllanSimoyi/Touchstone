import type { EventFieldValue } from './models/events';

import { readFile } from 'fs/promises';

import { z } from 'zod';

import { prisma } from './db.server';
import { EventKind } from './models/events';

const FieldValueSchema = z
  .object({
    field: z.string(),
    value: z.string(),
  })
  .array();

const Schema = z.tuple([
  z.object({
    type: z.literal('table'),
    name: z.literal('accountants'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number(),
        accountId: z.coerce.number().int(),
        accountantName: z.string(),
        accountantEmailAddress: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('accounts'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number(),
        accountNumber: z.string(),
        companyName: z.string(),
        tradingAs: z.string(),
        formerly: z.string(),
        groupId: z.coerce.number().int(),
        areaId: z.coerce.number().int(),
        sectorId: z.coerce.number().int(),
        vatNumber: z.coerce.number(),
        otherNamesOnCheques: z.string(),
        description: z.string(),
        actual: z.coerce.number(),
        reason: z.string(),
        statusId: z.coerce.number().int(),
        contractNumber: z.string(),
        dateOfContract: z.null().or(z.coerce.bigint()),
        licenseId: z.coerce.number().int(),
        licenseDetailId: z.coerce.number().int(),
        addedPercentage: z.coerce.number().int(),
        gross: z.coerce.number().int(),
        net: z.coerce.number().int(),
        vat: z.coerce.number().int(),
        comment: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('areas'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number(),
        identifier: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('boxes'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number(),
        accountId: z.coerce.number().int(),
        boxCityId: z.coerce.number().int(),
        boxNumber: z.string(),
        boxArea: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('ceos'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number(),
        accountId: z.coerce.number().int(),
        ceoName: z.string(),
        ceoEmailAddress: z.string(),
        ceoPhoneNumber: z.string(),
        ceoFaxNumber: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('cities'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number(),
        identifier: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('contacts'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number().int(),
        accountId: z.coerce.number().int(),
        physicalAddress: z.string(),
        telephoneNumber: z.string(),
        faxNumber: z.string(),
        cellphoneNumber: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('databasez'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number().int(),
        accountId: z.coerce.number().int(),
        databaseName: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('deliveryaddresses'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number().int(),
        accountId: z.coerce.number().int(),
        deliveryCityId: z.coerce.number().int(),
        deliveryAddress: z.string(),
        deliverySuburb: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('eventz'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number().int(),
        kind: z.string(),
        tableName: z.string(),
        recordId: z.coerce.number().int(),
        details: z.string(),
        userId: z.coerce.number().int(),
        username: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('groupz'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number().int(),
        identifier: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('licensedetails'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number().int(),
        identifier: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('licenses'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number().int(),
        identifier: z.string(),
        basicUsd: z.coerce.number().int(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('operatorz'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number().int(),
        accountId: z.coerce.number().int(),
        operatorName: z.string(),
        operatorEmailAddress: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('roles'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number().int(),
        accessLevel: z.string(),
        feature: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('sectors'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number().int(),
        identifier: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('statuses'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number().int(),
        identifier: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('titlez'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number().int(),
        identifier: z.string(),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
  z.object({
    type: z.literal('table'),
    name: z.literal('users'),
    database: z.literal('old_touchstone'),
    data: z
      .object({
        id: z.coerce.number().int(),
        username: z.string(),
        password: z.string(),
        accessLevel: z.enum([
          'Level 1',
          'Level 2',
          'Level 3',
          'Level 4',
          'Level 5',
        ]),
        createdAt: z.coerce.bigint(),
        updatedAt: z.coerce.bigint(),
      })
      .array(),
  }),
]);

(async () => {
  try {
    const rawData = (await readFile('./old_touchstone.json')).toString();
    const data = JSON.parse(rawData);
    const result = Schema.safeParse(data);
    if (!result.success) {
      const { fieldErrors, formErrors } = result.error.flatten();
      throw new Error('Errors: ' + JSON.stringify({ fieldErrors, formErrors }));
    }
    const [
      { data: oldAccountants },
      { data: oldAccounts },
      { data: oldAreas },
      { data: oldBoxes },
      { data: oldCeos },
      { data: oldCities },
      { data: oldContacts },
      { data: oldDatabases },
      { data: oldDeliveryAddresses },
      { data: oldEvents },
      { data: oldGroups },
      { data: oldLicenseDetails },
      { data: oldLicenses },
      { data: oldOperators },
      _,
      { data: oldSectors },
      { data: oldStatuses },
      __,
      { data: oldUsers },
    ] = result.data;
    console.log(_.type, __.type);

    for (let oldCity of oldCities) {
      await prisma.city.create({
        data: {
          id: oldCity.id,
          identifier: oldCity.identifier,
          createdAt: new Date(Number(oldCity.createdAt)),
          updatedAt: new Date(Number(oldCity.updatedAt)),
        },
      });
    }

    for (let oldLicenseDetail of oldLicenseDetails) {
      await prisma.licenseDetail.create({
        data: {
          id: oldLicenseDetail.id,
          identifier: oldLicenseDetail.identifier,
          createdAt: new Date(Number(oldLicenseDetail.createdAt)),
          updatedAt: new Date(Number(oldLicenseDetail.updatedAt)),
        },
      });
    }

    for (let oldLicense of oldLicenses) {
      await prisma.license.create({
        data: {
          id: oldLicense.id,
          identifier: oldLicense.identifier,
          basicUsd: Number((oldLicense.basicUsd / 100).toFixed(2)),
          createdAt: new Date(Number(oldLicense.createdAt)),
          updatedAt: new Date(Number(oldLicense.updatedAt)),
        },
      });
    }

    for (let oldStatus of oldStatuses) {
      await prisma.status.create({
        data: {
          id: oldStatus.id,
          identifier: oldStatus.identifier,
          createdAt: new Date(Number(oldStatus.createdAt)),
          updatedAt: new Date(Number(oldStatus.updatedAt)),
        },
      });
    }

    for (let oldUser of oldUsers) {
      await prisma.user.create({
        data: {
          id: oldUser.id,
          username: oldUser.username,
          password: oldUser.password,
          accessLevel: oldUser.accessLevel,
          createdAt: new Date(Number(oldUser.createdAt)),
          updatedAt: new Date(Number(oldUser.updatedAt)),
        },
      });
    }

    for (let oldGroup of oldGroups) {
      await prisma.group.create({
        data: {
          id: oldGroup.id,
          identifier: oldGroup.identifier,
          createdAt: new Date(Number(oldGroup.createdAt)),
          updatedAt: new Date(Number(oldGroup.updatedAt)),
        },
      });
    }

    for (let oldArea of oldAreas) {
      await prisma.area.create({
        data: {
          id: oldArea.id,
          identifier: oldArea.identifier,
          createdAt: new Date(Number(oldArea.createdAt)),
          updatedAt: new Date(Number(oldArea.updatedAt)),
        },
      });
    }

    for (let oldSector of oldSectors) {
      await prisma.sector.create({
        data: {
          id: oldSector.id,
          identifier: oldSector.identifier,
          createdAt: new Date(Number(oldSector.createdAt)),
          updatedAt: new Date(Number(oldSector.updatedAt)),
        },
      });
    }

    for (let oldAccount of oldAccounts) {
      const accountant = oldAccountants.find(
        (accountant) => accountant.accountId === oldAccount.id
      );
      const box = oldBoxes.find((box) => box.accountId === oldAccount.id);
      const ceo = oldCeos.find((ceo) => ceo.accountId === oldAccount.id);
      const contact = oldContacts.find(
        (contact) => contact.accountId === oldAccount.id
      );
      const deliveryAddress = oldDeliveryAddresses.find(
        (addr) => addr.accountId === oldAccount.id
      );
      const databases = oldDatabases.filter(
        (database) => database.accountId === oldAccount.id
      );
      const operators = oldOperators.filter(
        (operator) => operator.accountId === oldAccount.id
      );
      const license = oldLicenses.find(
        (license) => license.id === oldAccount.licenseId
      );
      const licenseId = license?.id || null;
      await prisma.account.create({
        data: {
          id: oldAccount.id,
          accountNumber: oldAccount.accountNumber,
          companyName: oldAccount.companyName,
          tradingAs: oldAccount.tradingAs,
          formerly: oldAccount.formerly,
          groupId: oldAccount.groupId || null,
          areaId: oldAccount.areaId || null,
          sectorId: oldAccount.sectorId || null,
          vatNumber: oldAccount.vatNumber.toString(),
          otherNames: oldAccount.otherNamesOnCheques,
          description: oldAccount.description,
          actual: oldAccount.actual,
          reason: oldAccount.reason,
          statusId: oldAccount.statusId || null,
          contractNumber: oldAccount.contractNumber,
          dateOfContract: oldAccount.dateOfContract
            ? new Date(Number(oldAccount.dateOfContract))
            : null,
          licenseId: licenseId,
          licenseDetailId: oldAccount.licenseDetailId || null,
          addedPercentage: oldAccount.addedPercentage,
          gross: Number((oldAccount.gross / 100).toFixed(2)),
          net: Number((oldAccount.net / 100).toFixed(2)),
          vat: Number((oldAccount.vat / 100).toFixed(2)),
          comment: oldAccount.comment,
          accountantName: accountant?.accountantName || '',
          accountantEmail: accountant?.accountantEmailAddress || '',
          boxCityId: box?.boxCityId || null,
          boxNumber: box?.boxNumber || '',
          boxArea: box?.boxArea || '',
          ceoName: ceo?.ceoName || '',
          ceoEmail: ceo?.ceoEmailAddress || '',
          ceoPhone: ceo?.ceoPhoneNumber || '',
          ceoFax: ceo?.ceoFaxNumber || '',
          physicalAddress: contact?.physicalAddress || '',
          telephoneNumber: contact?.telephoneNumber || '',
          faxNumber: contact?.faxNumber || '',
          cellphoneNumber: contact?.cellphoneNumber || '',
          deliveryAddress: deliveryAddress?.deliveryAddress || '',
          deliverySuburb: deliveryAddress?.deliverySuburb || '',
          deliveryCityId: deliveryAddress?.deliveryCityId || null,
          // databases: {
          //   create: databases.map((database) => ({
          //     databaseName: database.databaseName,
          //     createdAt: new Date(Number(database.createdAt)),
          //     updatedAt: new Date(Number(database.updatedAt)),
          //   })),
          // },
          // operators: {
          //   create: operators.map((operator) => ({
          //     operatorName: operator.operatorName,
          //     operatorEmail: operator.operatorEmailAddress,
          //     createdAt: new Date(Number(operator.createdAt)),
          //     updatedAt: new Date(Number(operator.updatedAt)),
          //   })),
          // },
        },
      });
      for (let database of databases) {
        await prisma.database.upsert({
          where: { databaseName: database.databaseName },
          update: {},
          create: {
            accountId: oldAccount.id,
            databaseName: database.databaseName,
            createdAt: new Date(Number(database.createdAt)),
            updatedAt: new Date(Number(database.updatedAt)),
          },
        });
      }
      for (let operator of operators) {
        await prisma.operator.upsert({
          where: { operatorName: operator.operatorName },
          update: {},
          create: {
            accountId: oldAccount.id,
            operatorName: operator.operatorName,
            operatorEmail: operator.operatorEmailAddress,
            createdAt: new Date(Number(operator.createdAt)),
            updatedAt: new Date(Number(operator.updatedAt)),
          },
        });
      }
    }

    const oldAccountEvents = oldEvents.filter(
      (event) => event.tableName === 'accounts'
    );
    for (let oldAccountEvent of oldAccountEvents) {
      const details = getNewEventDetails(
        oldAccountEvent,
        getPrevEvent(oldAccountEvents, oldAccountEvent)
      );
      if (!details) {
        continue;
      }
      await prisma.accountEvent.create({
        data: {
          accountId: oldAccountEvent.recordId,
          userId: oldAccountEvent.userId,
          details: JSON.stringify(details),
          kind: oldToNewKind(oldAccountEvent.kind),
        },
      });
    }

    const oldAreaEvents = oldEvents.filter(
      (event) => event.tableName === 'areas'
    );
    for (let oldAreaEvent of oldAreaEvents) {
      const details = getNewEventDetails(
        oldAreaEvent,
        getPrevEvent(oldAreaEvents, oldAreaEvent)
      );
      if (!details) {
        continue;
      }
      if (oldAreas.every((el) => el.id !== oldAreaEvent.recordId)) {
        continue;
      }
      if (oldUsers.every((el) => el.id !== oldAreaEvent.userId)) {
        continue;
      }
      await prisma.areaEvent.create({
        data: {
          areaId: oldAreaEvent.recordId,
          userId: oldAreaEvent.userId,
          details: JSON.stringify(details),
          kind: oldToNewKind(oldAreaEvent.kind),
        },
      });
    }

    const oldCityEvents = oldEvents.filter(
      (event) => event.tableName === 'cities'
    );
    for (let oldCityEvent of oldCityEvents) {
      const details = getNewEventDetails(
        oldCityEvent,
        getPrevEvent(oldCityEvents, oldCityEvent)
      );
      if (!details) {
        continue;
      }
      await prisma.cityEvent.create({
        data: {
          cityId: oldCityEvent.recordId,
          userId: oldCityEvent.userId,
          details: JSON.stringify(details),
          kind: oldToNewKind(oldCityEvent.kind),
        },
      });
    }

    // const oldDatabaseEvents = oldEvents.filter(
    //   (event) => event.tableName === 'databases'
    // );
    // for (let oldDatabaseEvent of oldDatabaseEvents) {
    //   const details = getNewEventDetails(
    //     oldDatabaseEvent,
    //     getPrevEvent(oldDatabaseEvents, oldDatabaseEvent)
    //   );
    //   if (!details) {
    //     continue;
    //   }
    //   if (oldDatabases.every((el) => el.id !== oldDatabaseEvent.recordId)) {
    //     continue;
    //   }
    //   if (oldUsers.every((el) => el.id !== oldDatabaseEvent.userId)) {
    //     continue;
    //   }
    //   await prisma.databaseEvent.create({
    //     data: {
    //       databaseId: oldDatabaseEvent.recordId,
    //       userId: oldDatabaseEvent.userId,
    //       details: JSON.stringify(details),
    //       kind: oldToNewKind(oldDatabaseEvent.kind),
    //     },
    //   });
    // }

    // const oldGroupEvents = oldEvents.filter(
    //   (event) => event.tableName === 'groups'
    // );
    // for (let oldGroupEvent of oldGroupEvents) {
    //   const details = getNewEventDetails(
    //     oldGroupEvent,
    //     getPrevEvent(oldGroupEvents, oldGroupEvent)
    //   );
    //   if (!details) {
    //     continue;
    //   }
    //   await prisma.groupEvent.create({
    //     data: {
    //       groupId: oldGroupEvent.recordId,
    //       userId: oldGroupEvent.userId,
    //       details: JSON.stringify(details),
    //       kind: oldToNewKind(oldGroupEvent.kind),
    //     },
    //   });
    // }

    // const oldLicenseDetailEvents = oldEvents.filter(
    //   (event) => event.tableName === 'licensedetails'
    // );
    // for (let oldLicenseDetailEvent of oldLicenseDetailEvents) {
    //   const details = getNewEventDetails(
    //     oldLicenseDetailEvent,
    //     getPrevEvent(oldLicenseDetailEvents, oldLicenseDetailEvent)
    //   );
    //   if (!details) {
    //     continue;
    //   }
    //   await prisma.licenseDetailEvent.create({
    //     data: {
    //       licenseDetailId: oldLicenseDetailEvent.recordId,
    //       userId: oldLicenseDetailEvent.userId,
    //       details: JSON.stringify(details),
    //       kind: oldToNewKind(oldLicenseDetailEvent.kind),
    //     },
    //   });
    // }

    // const oldLicenseEvents = oldEvents.filter(
    //   (event) => event.tableName === 'licenses'
    // );
    // for (let oldLicenseEvent of oldLicenseEvents) {
    //   const details = getNewEventDetails(
    //     oldLicenseEvent,
    //     getPrevEvent(oldLicenseEvents, oldLicenseEvent)
    //   );
    //   if (!details) {
    //     continue;
    //   }
    //   await prisma.licenseEvent.create({
    //     data: {
    //       licenseId: oldLicenseEvent.recordId,
    //       userId: oldLicenseEvent.userId,
    //       details: JSON.stringify(details),
    //       kind: oldToNewKind(oldLicenseEvent.kind),
    //     },
    //   });
    // }

    // const oldOperatorEvents = oldEvents.filter(
    //   (event) => event.tableName === 'operators'
    // );
    // for (let oldOperatorEvent of oldOperatorEvents) {
    //   const details = getNewEventDetails(
    //     oldOperatorEvent,
    //     getPrevEvent(oldOperatorEvents, oldOperatorEvent)
    //   );
    //   if (!details) {
    //     continue;
    //   }
    //   await prisma.operatorEvent.create({
    //     data: {
    //       operatorId: oldOperatorEvent.recordId,
    //       userId: oldOperatorEvent.userId,
    //       details: JSON.stringify(details),
    //       kind: oldToNewKind(oldOperatorEvent.kind),
    //     },
    //   });
    // }

    // const oldSectorEvents = oldEvents.filter(
    //   (event) => event.tableName === 'sectors'
    // );
    // for (let oldSectorEvent of oldSectorEvents) {
    //   const details = getNewEventDetails(
    //     oldSectorEvent,
    //     getPrevEvent(oldSectorEvents, oldSectorEvent)
    //   );
    //   if (!details) {
    //     continue;
    //   }
    //   await prisma.sectorEvent.create({
    //     data: {
    //       sectorId: oldSectorEvent.recordId,
    //       userId: oldSectorEvent.userId,
    //       details: JSON.stringify(details),
    //       kind: oldToNewKind(oldSectorEvent.kind),
    //     },
    //   });
    // }

    // const oldStatusEvents = oldEvents.filter(
    //   (event) => event.tableName === 'statuses'
    // );
    // for (let oldStatusEvent of oldStatusEvents) {
    //   const details = getNewEventDetails(
    //     oldStatusEvent,
    //     getPrevEvent(oldStatusEvents, oldStatusEvent)
    //   );
    //   if (!details) {
    //     continue;
    //   }
    //   await prisma.sectorEvent.create({
    //     data: {
    //       sectorId: oldStatusEvent.recordId,
    //       userId: oldStatusEvent.userId,
    //       details: JSON.stringify(details),
    //       kind: oldToNewKind(oldStatusEvent.kind),
    //     },
    //   });
    // }

    // const oldUserEvents = oldEvents.filter(
    //   (event) => event.tableName === 'users'
    // );
    // for (let oldUserEvent of oldUserEvents) {
    //   const details = getNewEventDetails(
    //     oldUserEvent,
    //     getPrevEvent(oldUserEvents, oldUserEvent)
    //   );
    //   if (!details) {
    //     continue;
    //   }
    //   await prisma.userEvent.create({
    //     data: {
    //       recordId: oldUserEvent.recordId,
    //       userId: oldUserEvent.userId,
    //       details: JSON.stringify(details),
    //       kind: oldToNewKind(oldUserEvent.kind),
    //     },
    //   });
    // }
  } catch (error) {
    console.error(error);
  }
})();

function oldToNewKind(old: string) {
  if (old === 'Record') {
    return EventKind.Create;
  }
  if (old === 'Delete') {
    return EventKind.Delete;
  }
  return EventKind.Update;
}

interface UpgradeEventProps {
  input:
    | {
        kind: 'Record';
        event: { field: string; value: string }[];
      }
    | {
        kind: 'Delete';
        event: { field: string; value: string }[];
      }
    | {
        kind: 'Update';
        event: { field: string; value: string }[];
        priorEvent: { field: string; value: string }[] | undefined;
      };
}
function upgradeEvent(props: UpgradeEventProps) {
  const { input } = props;
  if (input.kind === 'Record') {
    return input.event.reduce((acc, { field, value }) => {
      return {
        ...acc,
        [field]: value,
      };
    }, {} as Record<string, EventFieldValue>);
  }
  if (input.kind === 'Delete') {
    return input.event.reduce((acc, { field, value }) => {
      return {
        ...acc,
        [field]: value,
      };
    }, {} as Record<string, EventFieldValue>);
  }
  return input.event.reduce((acc, { field, value }) => {
    const priorValue =
      input.priorEvent?.find((el) => el.field === field)?.value || '';
    return {
      ...acc,
      [field]: {
        from: priorValue,
        to: value,
      },
    };
  }, {} as Record<string, { from: EventFieldValue; to: EventFieldValue }>);
}

function getNewEventDetails(
  currentOldEvent: { details: string; kind: string },
  rawPrevEvent: unknown
) {
  const { details, kind } = currentOldEvent;
  try {
    const rawOldDetails = JSON.parse(details);
    const oldEvent = FieldValueSchema.parse(rawOldDetails);
    if (kind === 'Record') {
      return upgradeEvent({ input: { kind: 'Record', event: oldEvent } });
    }
    if (kind === 'Delete') {
      return upgradeEvent({ input: { kind: 'Delete', event: oldEvent } });
    }
    const oldPrevEvent = FieldValueSchema.parse(rawPrevEvent);
    return upgradeEvent({
      input: {
        kind: 'Update',
        event: oldEvent,
        priorEvent: oldPrevEvent,
      },
    });
  } catch (error) {
    return undefined;
  }
}

function getPrevEvent<T>(events: T[], currentEvent: T) {
  const index = events.indexOf(currentEvent);
  return index > 0 && index < events.length ? events[index - 1] : undefined;
}

import type { CreateOrDeleteEventDetails } from '~/models/events';

import { json, type ActionArgs } from '@remix-run/node';

import { prisma } from '~/db.server';
import {
  AddRecordSchema,
  badRequest,
  processBadRequest,
} from '~/models/core.validations';
import { getErrorMessage } from '~/models/errors';
import { EventKind } from '~/models/events';
import { getRawFormFields } from '~/models/forms';
import { customServerLog, logParseError } from '~/models/logger.server';
import { requireUserId } from '~/session.server';

export async function action({ request }: ActionArgs) {
  const currentUserId = await requireUserId(request);
  try {
    const fields = await getRawFormFields(request);
    const result = AddRecordSchema.safeParse(fields);
    if (!result.success) {
      logParseError(request, result.error, fields);
      return processBadRequest(result.error, fields);
    }

    await (async () => {
      if (result.data.recordType === 'Area') {
        const { name } = result.data;
        const numDuplicates = await prisma.area.count({
          where: { identifier: name },
        });
        if (numDuplicates) {
          return badRequest({
            fieldErrors: { name: [`${name} already entered`] },
          });
        }
        return prisma.$transaction(async (tx) => {
          const addResult = await prisma.area.create({
            data: { identifier: name },
          });
          const details: CreateOrDeleteEventDetails = {
            name,
          };
          await tx.areaEvent.create({
            data: {
              areaId: addResult.id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Create,
            },
          });
          customServerLog('info', 'Added area', result.data, request);
          return addResult;
        });
      }
      if (result.data.recordType === 'City') {
        const { name } = result.data;
        const numDuplicates = await prisma.city.count({
          where: { identifier: name },
        });
        if (numDuplicates) {
          return badRequest({
            fieldErrors: { name: [`${name} already entered`] },
          });
        }
        return prisma.$transaction(async (tx) => {
          const addResult = await prisma.city.create({
            data: { identifier: name },
          });
          const details: CreateOrDeleteEventDetails = {
            name,
          };
          await tx.cityEvent.create({
            data: {
              cityId: addResult.id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Create,
            },
          });
          customServerLog('info', 'Added city', result.data, request);
          return addResult;
        });
      }
      if (result.data.recordType === 'Group') {
        const { name } = result.data;
        const numDuplicates = await prisma.group.count({
          where: { identifier: name },
        });
        if (numDuplicates) {
          return badRequest({
            fieldErrors: { name: [`${name} already entered`] },
          });
        }
        return prisma.$transaction(async (tx) => {
          const addResult = await prisma.group.create({
            data: { identifier: name },
          });
          const details: CreateOrDeleteEventDetails = {
            name,
          };
          await tx.groupEvent.create({
            data: {
              groupId: addResult.id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Create,
            },
          });
          customServerLog('info', 'Added group', result.data, request);
          return addResult;
        });
      }
      if (result.data.recordType === 'LicenseDetail') {
        const { name } = result.data;
        const numDuplicates = await prisma.licenseDetail.count({
          where: { identifier: name },
        });
        if (numDuplicates) {
          return badRequest({
            fieldErrors: { name: [`${name} already entered`] },
          });
        }
        return prisma.$transaction(async (tx) => {
          const addResult = await prisma.licenseDetail.create({
            data: { identifier: name },
          });
          const details: CreateOrDeleteEventDetails = {
            name,
          };
          await tx.licenseDetailEvent.create({
            data: {
              licenseDetailId: addResult.id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Create,
            },
          });
          customServerLog('info', 'Added licenseDetail', result.data, request);
          return addResult;
        });
      }
      if (result.data.recordType === 'License') {
        const { name, basicUsd } = result.data;
        return prisma.$transaction(async (tx) => {
          const addResult = await prisma.license.create({
            data: { identifier: name, basicUsd },
          });
          const details: CreateOrDeleteEventDetails = {
            name,
            basicUsd,
          };
          await tx.licenseEvent.create({
            data: {
              licenseId: addResult.id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Create,
            },
          });
          customServerLog('info', 'Added license', result.data, request);
          return addResult;
        });
      }
      if (result.data.recordType === 'Sector') {
        const { name } = result.data;
        const numDuplicates = await prisma.sector.count({
          where: { identifier: name },
        });
        if (numDuplicates) {
          return badRequest({
            fieldErrors: { name: [`${name} already entered`] },
          });
        }
        return prisma.$transaction(async (tx) => {
          const addResult = await prisma.sector.create({
            data: { identifier: name },
          });
          const details: CreateOrDeleteEventDetails = {
            name,
          };
          await tx.sectorEvent.create({
            data: {
              sectorId: addResult.id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Create,
            },
          });
          customServerLog('info', 'Added sector', result.data, request);
          return addResult;
        });
      }
      if (result.data.recordType === 'Status') {
        const { name } = result.data;
        const numDuplicates = await prisma.status.count({
          where: { identifier: name },
        });
        if (numDuplicates) {
          return badRequest({
            fieldErrors: { name: [`${name} already entered`] },
          });
        }
        return prisma.$transaction(async (tx) => {
          const addResult = await prisma.status.create({
            data: { identifier: name },
          });
          const details: CreateOrDeleteEventDetails = {
            name,
          };
          await tx.statusEvent.create({
            data: {
              statusId: addResult.id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Create,
            },
          });
          customServerLog('info', 'Added status', result.data, request);
          return addResult;
        });
      }
    })();

    return json({ success: true });
  } catch (error) {
    const formError =
      getErrorMessage(error) ||
      'Something went wrong creating the record, please try again';
    customServerLog('error', formError, {}, request);
    return badRequest({ formError });
  }
}

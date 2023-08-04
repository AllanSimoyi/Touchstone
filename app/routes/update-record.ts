import type { UpdateEventDetails } from '~/models/events';

import { json, type ActionArgs } from '@remix-run/node';

import { prisma } from '~/db.server';
import {
  UpdateRecordSchema,
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
    const result = UpdateRecordSchema.safeParse(fields);
    if (!result.success) {
      logParseError(request, result.error, fields);
      return processBadRequest(result.error, fields);
    }
    customServerLog('info', 'Input', result.data, request);

    if (result.data.recordType === 'Area') {
      const { id, name } = result.data;
      return prisma.$transaction(async (tx) => {
        const oldRecord = await tx.area.findUnique({
          where: { id },
        });
        if (!oldRecord) {
          throw new Error('Record not found');
        }
        const updateResult = await tx.area.update({
          where: { id },
          data: { identifier: name },
        });
        const details: UpdateEventDetails = {
          name: { from: oldRecord.identifier, to: name },
        };
        await tx.areaEvent.create({
          data: {
            areaId: id,
            userId: currentUserId,
            details: JSON.stringify(details),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated area', result.data, request);
        return updateResult;
      });
    }
    if (result.data.recordType === 'City') {
      const { id, name } = result.data;
      return prisma.$transaction(async (tx) => {
        const oldRecord = await tx.city.findUnique({
          where: { id },
        });
        if (!oldRecord) {
          throw new Error('Record not found');
        }
        const updateResult = await tx.city.update({
          where: { id },
          data: { identifier: name },
        });
        const details: UpdateEventDetails = {
          name: { from: oldRecord.identifier, to: name },
        };
        await tx.cityEvent.create({
          data: {
            cityId: id,
            userId: currentUserId,
            details: JSON.stringify(details),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated city', result.data, request);
        return updateResult;
      });
    }
    if (result.data.recordType === 'Group') {
      const { id, name } = result.data;
      return prisma.$transaction(async (tx) => {
        const oldRecord = await tx.group.findUnique({
          where: { id },
        });
        if (!oldRecord) {
          throw new Error('Record not found');
        }
        const updateResult = await tx.group.update({
          where: { id },
          data: { identifier: name },
        });
        const details: UpdateEventDetails = {
          name: { from: oldRecord.identifier, to: name },
        };
        await tx.groupEvent.create({
          data: {
            groupId: id,
            userId: currentUserId,
            details: JSON.stringify(details),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated group', result.data, request);
        return updateResult;
      });
    }
    if (result.data.recordType === 'LicenseDetail') {
      const { id, name } = result.data;
      return prisma.$transaction(async (tx) => {
        const oldRecord = await tx.licenseDetail.findUnique({
          where: { id },
        });
        if (!oldRecord) {
          throw new Error('Record not found');
        }
        const updateResult = await tx.licenseDetail.update({
          where: { id },
          data: { identifier: name },
        });
        const details: UpdateEventDetails = {
          name: { from: oldRecord.identifier, to: name },
        };
        await tx.licenseDetailEvent.create({
          data: {
            licenseDetailId: id,
            userId: currentUserId,
            details: JSON.stringify(details),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated licenseDetail', result.data, request);
        return updateResult;
      });
    }
    if (result.data.recordType === 'License') {
      const { id, name, basicUsd } = result.data;
      return prisma.$transaction(async (tx) => {
        const oldRecord = await tx.license.findUnique({
          where: { id },
        });
        if (!oldRecord) {
          throw new Error('Record not found');
        }
        const updateResult = await tx.license.update({
          where: { id },
          data: { identifier: name, basicUsd },
        });
        const details: UpdateEventDetails = {
          name: { from: oldRecord.identifier, to: name },
          basicUsd: {
            from: oldRecord.basicUsd.toNumber().toString(),
            to: basicUsd.toString(),
          },
        };
        await tx.licenseEvent.create({
          data: {
            licenseId: id,
            userId: currentUserId,
            details: JSON.stringify(details),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated license', result.data, request);
        return updateResult;
      });
    }
    if (result.data.recordType === 'Sector') {
      const { id, name } = result.data;
      return prisma.$transaction(async (tx) => {
        const oldRecord = await tx.sector.findUnique({
          where: { id },
        });
        if (!oldRecord) {
          throw new Error('Record not found');
        }
        const updateResult = await prisma.sector.update({
          where: { id },
          data: { identifier: name },
        });
        const details: UpdateEventDetails = {
          name: { from: oldRecord.identifier, to: name },
        };
        await tx.sectorEvent.create({
          data: {
            sectorId: id,
            userId: currentUserId,
            details: JSON.stringify(details),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated sector', result.data, request);
        return updateResult;
      });
    }
    if (result.data.recordType === 'Status') {
      const { id, name } = result.data;
      return prisma.$transaction(async (tx) => {
        const oldRecord = await tx.sector.findUnique({
          where: { id },
        });
        if (!oldRecord) {
          throw new Error('Record not found');
        }
        const updateResult = await prisma.status.update({
          where: { id },
          data: { identifier: name },
        });
        const details: UpdateEventDetails = {
          name: { from: oldRecord.identifier, to: name },
        };
        await tx.statusEvent.create({
          data: {
            statusId: id,
            userId: currentUserId,
            details: JSON.stringify(details),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated status', result.data, request);
        return updateResult;
      });
    }

    return json({ success: true });
  } catch (error) {
    const formError =
      getErrorMessage(error) ||
      'Something went wrong updating the record, please try again';
    customServerLog('error', formError, {}, request);
    return badRequest({ formError });
  }
}

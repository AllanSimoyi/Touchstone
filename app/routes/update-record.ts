import type { UpdateEventDetails } from '~/models/events';

import { json, type ActionArgs } from '@remix-run/node';

import { prisma } from '~/db.server';
import {
  UpdateRecordSchema,
  badRequest,
  processBadRequest,
} from '~/models/core.validations';
import { getErrorMessage } from '~/models/errors';
import { EventKind, getOnlyChangedUpdateDetails } from '~/models/events';
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
      const numDuplicates = await prisma.area.count({
        where: { identifier: name, id: { not: id } },
      });
      if (numDuplicates) {
        return badRequest({
          fieldErrors: { name: [`${name} already entered`] },
        });
      }
      await prisma.$transaction(async (tx) => {
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
            details: JSON.stringify(getOnlyChangedUpdateDetails(details)),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated area', result.data, request);
        return updateResult;
      });
    }
    if (result.data.recordType === 'City') {
      const { id, name } = result.data;
      const numDuplicates = await prisma.city.count({
        where: { identifier: name, id: { not: id } },
      });
      if (numDuplicates) {
        return badRequest({
          fieldErrors: { name: [`${name} already entered`] },
        });
      }
      await prisma.$transaction(async (tx) => {
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
            details: JSON.stringify(getOnlyChangedUpdateDetails(details)),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated city', result.data, request);
        return updateResult;
      });
    }
    if (result.data.recordType === 'Group') {
      const { id, name } = result.data;
      const numDuplicates = await prisma.group.count({
        where: { identifier: name, id: { not: id } },
      });
      if (numDuplicates) {
        return badRequest({
          fieldErrors: { name: [`${name} already entered`] },
        });
      }
      await prisma.$transaction(async (tx) => {
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
            details: JSON.stringify(getOnlyChangedUpdateDetails(details)),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated group', result.data, request);
        return updateResult;
      });
    }
    if (result.data.recordType === 'LicenseDetail') {
      const { id, name } = result.data;
      const numDuplicates = await prisma.licenseDetail.count({
        where: { identifier: name, id: { not: id } },
      });
      if (numDuplicates) {
        return badRequest({
          fieldErrors: { name: [`${name} already entered`] },
        });
      }
      await prisma.$transaction(async (tx) => {
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
            details: JSON.stringify(getOnlyChangedUpdateDetails(details)),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated licenseDetail', result.data, request);
        return updateResult;
      });
    }
    if (result.data.recordType === 'License') {
      const { id, name, basicUsd } = result.data;
      const numDuplicates = await prisma.license.count({
        where: { identifier: name, id: { not: id } },
      });
      if (numDuplicates) {
        return badRequest({
          fieldErrors: { name: [`${name} already entered`] },
        });
      }
      await prisma.$transaction(async (tx) => {
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
            details: JSON.stringify(getOnlyChangedUpdateDetails(details)),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated license', result.data, request);
        return updateResult;
      });
    }
    if (result.data.recordType === 'Sector') {
      const { id, name } = result.data;
      const numDuplicates = await prisma.sector.count({
        where: { identifier: name, id: { not: id } },
      });
      if (numDuplicates) {
        return badRequest({
          fieldErrors: { name: [`${name} already entered`] },
        });
      }
      await prisma.$transaction(async (tx) => {
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
            details: JSON.stringify(getOnlyChangedUpdateDetails(details)),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated sector', result.data, request);
        return updateResult;
      });
    }
    if (result.data.recordType === 'Status') {
      const { id, name } = result.data;
      const numDuplicates = await prisma.status.count({
        where: { identifier: name, id: { not: id } },
      });
      if (numDuplicates) {
        return badRequest({
          fieldErrors: { name: [`${name} already entered`] },
        });
      }
      await prisma.$transaction(async (tx) => {
        const oldRecord = await tx.status.findUnique({
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
            details: JSON.stringify(getOnlyChangedUpdateDetails(details)),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated status', result.data, request);
        return updateResult;
      });
    }
    if (result.data.recordType === 'SupportJob') {
      const {
        id,
        accountId,
        clientStaffName,
        supportPersonId,
        supportType,
        status,
        enquiry,
        actionTaken,
        charge,
        date,
        userId,
      } = result.data;
      const [oldRecord, newAccount, newSupportPerson, newUser] =
        await Promise.all([
          prisma.supportJob.findUnique({
            where: { id },
            select: {
              account: { select: { id: true, companyName: true } },
              clientStaffName: true,
              supportPerson: { select: { id: true, username: true } },
              supportType: true,
              status: true,
              enquiry: true,
              actionTaken: true,
              charge: true,
              date: true,
              user: { select: { id: true, username: true } },
            },
          }),
          prisma.account.findUnique({
            where: { id: accountId },
            select: { companyName: true },
          }),
          prisma.user.findUnique({
            where: { id: supportPersonId },
            select: { username: true },
          }),
          prisma.user.findUnique({
            where: { id: userId },
            select: { username: true },
          }),
        ]);
      if (!oldRecord) {
        throw new Error('Record not found');
      }
      if (!newAccount) {
        throw new Error('New company record not found');
      }
      if (!newSupportPerson) {
        throw new Error('New support person record not found');
      }
      if (!newUser) {
        throw new Error('New user record not found');
      }
      await prisma.$transaction(async (tx) => {
        const updateResult = await tx.supportJob.update({
          where: { id },
          data: {
            accountId,
            clientStaffName,
            supportPersonId,
            supportType: JSON.stringify(supportType),
            status,
            enquiry,
            actionTaken,
            charge,
            date,
            userId,
          },
        });
        const details: UpdateEventDetails = {
          company: {
            from: oldRecord.account.companyName,
            to: newAccount.companyName,
          },
          clientStaffName: {
            from: oldRecord.clientStaffName,
            to: clientStaffName,
          },
          supportPerson: {
            from: oldRecord.supportPerson?.username || '',
            to: newSupportPerson.username,
          },
          supportType: {
            from: oldRecord.supportType,
            to: JSON.stringify(supportType),
          },
          status: { from: oldRecord.status, to: status },
          enquiry: { from: oldRecord.enquiry, to: enquiry },
          actionTaken: { from: oldRecord.actionTaken, to: actionTaken },
          charge: { from: oldRecord.charge.toNumber(), to: charge },
          date: { from: oldRecord.date, to: date },
          userId: { from: oldRecord.user.username, to: newUser.username },
        };
        await tx.supportJobEvent.create({
          data: {
            supportJobId: id,
            userId: currentUserId,
            details: JSON.stringify(getOnlyChangedUpdateDetails(details)),
            kind: EventKind.Update,
          },
        });
        customServerLog('info', 'Updated support job', result.data, request);
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

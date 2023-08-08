import type { CreateOrDeleteEventDetails } from '~/models/events';

import { json, type ActionArgs } from '@remix-run/node';
import dayjs from 'dayjs';

import { prisma } from '~/db.server';
import {
  DeleteRecordSchema,
  badRequest,
  processBadRequest,
} from '~/models/core.validations';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import { getErrorMessage } from '~/models/errors';
import { EventKind } from '~/models/events';
import { getRawFormFields } from '~/models/forms';
import { customServerLog, logParseError } from '~/models/logger.server';
import { requireUserId } from '~/session.server';

export async function action({ request }: ActionArgs) {
  const currentUserId = await requireUserId(request);
  try {
    const fields = await getRawFormFields(request);
    const result = DeleteRecordSchema.safeParse(fields);
    if (!result.success) {
      logParseError(request, result.error, fields);
      return processBadRequest(result.error, fields);
    }
    const { id, recordType } = result.data;
    customServerLog('info', 'Input', result.data, request);

    const mapping: Record<typeof recordType, () => Promise<any>> = {
      Account: () => {
        return prisma.$transaction(async (tx) => {
          const oldRecord = await tx.account.findUnique({
            where: { id },
            include: {
              group: true,
              area: true,
              sector: true,
              license: true,
              licenseDetail: true,
              boxCity: true,
              status: true,
              deliveryCity: true,
              databases: true,
              operators: true,
            },
          });
          if (!oldRecord) {
            throw new Error('Record not found');
          }
          await tx.account.delete({ where: { id } });
          const details: CreateOrDeleteEventDetails = {
            accountNumber: oldRecord.accountNumber,
            companyName: oldRecord.companyName,
            tradingAs: oldRecord.tradingAs,
            formerly: oldRecord.formerly,
            group: oldRecord.group?.identifier || '-',
            area: oldRecord.area?.identifier || '-',
            sector: oldRecord.sector?.identifier || '-',
            vatNumber: oldRecord.vatNumber,
            otherNames: oldRecord.otherNames,
            description: oldRecord.description,
            actual: oldRecord.actual,
            reason: oldRecord.reason,
            status: oldRecord.status?.identifier || '-',
            contractNumber: oldRecord.contractNumber,
            dateOfContract: dayjs(oldRecord.dateOfContract).format(
              DATE_INPUT_FORMAT
            ),
            license: oldRecord.licenseId?.toString() || '-',
            licenseDetail: oldRecord.licenseDetailId?.toString() || '-',
            addedPercentage: oldRecord.addedPercentage,
            gross: oldRecord.gross.toString(),
            net: oldRecord.net.toString(),
            vat: oldRecord.vat.toString(),
            comment: oldRecord.comment,
            accountantName: oldRecord.accountantName,
            accountantEmail: oldRecord.accountantEmail,
            boxCity: oldRecord.boxCityId?.toString() || '-',
            boxNumber: oldRecord.boxNumber,
            boxArea: oldRecord.boxArea,
            ceoName: oldRecord.ceoName,
            ceoEmail: oldRecord.ceoEmail,
            ceoPhone: oldRecord.ceoPhone,
            ceoFax: oldRecord.ceoFax,
            physicalAddress: oldRecord.physicalAddress,
            telephoneNumber: oldRecord.telephoneNumber,
            faxNumber: oldRecord.faxNumber,
            cellphoneNumber: oldRecord.cellphoneNumber,
            deliveryAddress: oldRecord.deliveryAddress,
            deliverySuburb: oldRecord.deliverySuburb,
            deliveryCity: oldRecord.deliveryCity?.identifier || '-',
            databases:
              oldRecord.databases.map((d) => d.databaseName).join(', ') || '-',
            operators:
              oldRecord.operators
                .map((o) => o.operatorName + '-' + o.operatorEmail)
                .join(', ') || '-',
            createdAt: dayjs(oldRecord.createdAt).format(DATE_INPUT_FORMAT),
            updatedAt: dayjs(oldRecord.updatedAt).format(DATE_INPUT_FORMAT),
          };
          await tx.accountEvent.create({
            data: {
              accountId: id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Delete,
            },
          });
        });
      },
      Area: () => {
        return prisma.$transaction(async (tx) => {
          const oldRecord = await tx.area.findUnique({
            where: { id },
          });
          if (!oldRecord) {
            throw new Error('Record not found');
          }
          await tx.area.delete({ where: { id } });
          const details: CreateOrDeleteEventDetails = {
            name: oldRecord.identifier,
            createdAt: dayjs(oldRecord.createdAt).format(DATE_INPUT_FORMAT),
            updatedAt: dayjs(oldRecord.updatedAt).format(DATE_INPUT_FORMAT),
          };
          await tx.areaEvent.create({
            data: {
              areaId: id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Delete,
            },
          });
        });
      },
      City: () => {
        return prisma.$transaction(async (tx) => {
          const oldRecord = await tx.city.findUnique({
            where: { id },
          });
          if (!oldRecord) {
            throw new Error('Record not found');
          }
          await tx.city.delete({ where: { id } });
          const details: CreateOrDeleteEventDetails = {
            name: oldRecord.identifier,
            createdAt: dayjs(oldRecord.createdAt).format(DATE_INPUT_FORMAT),
            updatedAt: dayjs(oldRecord.updatedAt).format(DATE_INPUT_FORMAT),
          };
          await tx.cityEvent.create({
            data: {
              cityId: id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Delete,
            },
          });
        });
      },
      Database: () => {
        return prisma.$transaction(async (tx) => {
          const oldRecord = await tx.database.findUnique({
            where: { id },
            select: {
              databaseName: true,
              createdAt: true,
              updatedAt: true,
              account: { select: { companyName: true } },
            },
          });
          if (!oldRecord) {
            throw new Error('Record not found');
          }
          await tx.database.delete({ where: { id } });
          const details: CreateOrDeleteEventDetails = {
            name: oldRecord.databaseName,
            account: oldRecord.account.companyName,
            createdAt: dayjs(oldRecord.createdAt).format(DATE_INPUT_FORMAT),
            updatedAt: dayjs(oldRecord.updatedAt).format(DATE_INPUT_FORMAT),
          };
          await tx.databaseEvent.create({
            data: {
              databaseId: id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Delete,
            },
          });
        });
      },
      Group: () => {
        return prisma.$transaction(async (tx) => {
          const oldRecord = await tx.group.findUnique({
            where: { id },
          });
          if (!oldRecord) {
            throw new Error('Record not found');
          }
          await tx.group.delete({ where: { id } });
          const details: CreateOrDeleteEventDetails = {
            name: oldRecord.identifier,
            createdAt: dayjs(oldRecord.createdAt).format(DATE_INPUT_FORMAT),
            updatedAt: dayjs(oldRecord.updatedAt).format(DATE_INPUT_FORMAT),
          };
          await tx.groupEvent.create({
            data: {
              groupId: id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Delete,
            },
          });
        });
      },
      LicenseDetail: () => {
        return prisma.$transaction(async (tx) => {
          const oldRecord = await tx.licenseDetail.findUnique({
            where: { id },
          });
          if (!oldRecord) {
            throw new Error('Record not found');
          }
          await tx.licenseDetail.delete({ where: { id } });
          const details: CreateOrDeleteEventDetails = {
            name: oldRecord.identifier,
            createdAt: dayjs(oldRecord.createdAt).format(DATE_INPUT_FORMAT),
            updatedAt: dayjs(oldRecord.updatedAt).format(DATE_INPUT_FORMAT),
          };
          await tx.licenseDetailEvent.create({
            data: {
              licenseDetailId: id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Delete,
            },
          });
        });
      },
      License: () => {
        return prisma.$transaction(async (tx) => {
          const oldRecord = await tx.license.findUnique({
            where: { id },
          });
          if (!oldRecord) {
            throw new Error('Record not found');
          }
          await tx.license.delete({ where: { id } });
          const details: CreateOrDeleteEventDetails = {
            name: oldRecord.identifier,
            basicUsd: Number(oldRecord.basicUsd).toFixed(2),
            createdAt: dayjs(oldRecord.createdAt).format(DATE_INPUT_FORMAT),
            updatedAt: dayjs(oldRecord.updatedAt).format(DATE_INPUT_FORMAT),
          };
          await tx.licenseEvent.create({
            data: {
              licenseId: id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Delete,
            },
          });
        });
      },
      Operator: () => {
        return prisma.$transaction(async (tx) => {
          const oldRecord = await tx.operator.findUnique({
            where: { id },
          });
          if (!oldRecord) {
            throw new Error('Record not found');
          }
          await tx.operator.delete({ where: { id } });
          const details: CreateOrDeleteEventDetails = {
            name: oldRecord.operatorName,
            email: oldRecord.operatorEmail,
            createdAt: dayjs(oldRecord.createdAt).format(DATE_INPUT_FORMAT),
            updatedAt: dayjs(oldRecord.updatedAt).format(DATE_INPUT_FORMAT),
          };
          await tx.operatorEvent.create({
            data: {
              operatorId: id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Delete,
            },
          });
        });
      },
      Sector: () => {
        return prisma.$transaction(async (tx) => {
          const oldRecord = await tx.sector.findUnique({
            where: { id },
          });
          if (!oldRecord) {
            throw new Error('Record not found');
          }
          await tx.sector.delete({ where: { id } });
          const details: CreateOrDeleteEventDetails = {
            name: oldRecord.identifier,
            createdAt: dayjs(oldRecord.createdAt).format(DATE_INPUT_FORMAT),
            updatedAt: dayjs(oldRecord.updatedAt).format(DATE_INPUT_FORMAT),
          };
          await tx.sectorEvent.create({
            data: {
              sectorId: id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Delete,
            },
          });
        });
      },
      Status: () => {
        return prisma.$transaction(async (tx) => {
          const oldRecord = await tx.status.findUnique({
            where: { id },
          });
          if (!oldRecord) {
            throw new Error('Record not found');
          }
          await tx.status.delete({ where: { id } });
          const details: CreateOrDeleteEventDetails = {
            name: oldRecord.identifier,
            createdAt: dayjs(oldRecord.createdAt).format(DATE_INPUT_FORMAT),
            updatedAt: dayjs(oldRecord.updatedAt).format(DATE_INPUT_FORMAT),
          };
          await tx.statusEvent.create({
            data: {
              statusId: id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Delete,
            },
          });
        });
      },
      SupportJob: () => {
        return prisma.$transaction(async (tx) => {
          const oldRecord = await tx.supportJob.findUnique({
            where: { id },
            select: {
              account: { select: { companyName: true } },
              clientStaffName: true,
              supportPerson: { select: { username: true } },
              supportType: true,
              status: true,
              enquiry: true,
              actionTaken: true,
              charge: true,
              date: true,
              user: { select: { username: true } },
            },
          });
          if (!oldRecord) {
            throw new Error('Record not found');
          }
          await tx.supportJob.delete({ where: { id } });
          const details: CreateOrDeleteEventDetails = {
            company: oldRecord.account.companyName,
            clientStaffName: oldRecord.clientStaffName,
            supportPerson: oldRecord.supportPerson?.username || '',
            supportType: oldRecord.supportType,
            status: oldRecord.status,
            enquiry: oldRecord.enquiry,
            actionTaken: oldRecord.actionTaken,
            charge: oldRecord.charge.toFixed(2),
            date: oldRecord.date,
            user: oldRecord.user.username,
          };
          await tx.supportJobEvent.create({
            data: {
              supportJobId: id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Delete,
            },
          });
        });
      },
      User: () => {
        return prisma.$transaction(async (tx) => {
          const oldRecord = await tx.user.findUnique({
            where: { id },
          });
          if (!oldRecord) {
            throw new Error('Record not found');
          }
          await tx.user.delete({ where: { id } });
          const details: CreateOrDeleteEventDetails = {
            username: oldRecord.username,
            accessLevel: oldRecord.accessLevel,
            createdAt: dayjs(oldRecord.createdAt).format(DATE_INPUT_FORMAT),
            updatedAt: dayjs(oldRecord.updatedAt).format(DATE_INPUT_FORMAT),
          };
          await tx.userEvent.create({
            data: {
              recordId: id,
              userId: currentUserId,
              details: JSON.stringify(details),
              kind: EventKind.Delete,
            },
          });
        });
      },
    };
    await mapping[recordType]?.();
    customServerLog(
      'info',
      `Deleted ${recordType.toLowerCase()}`,
      { id },
      request
    );

    return json({ success: true });
  } catch (error) {
    const formError =
      getErrorMessage(error) ||
      'Something went wrong deleting the record, please try again';
    customServerLog('error', formError, {}, request);
    return badRequest({ formError });
  }
}

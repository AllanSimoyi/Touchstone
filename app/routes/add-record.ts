import { json, type ActionArgs } from '@remix-run/node';

import { prisma } from '~/db.server';
import {
  AddRecordSchema,
  badRequest,
  processBadRequest,
} from '~/models/core.validations';
import { getErrorMessage } from '~/models/errors';
import { getRawFormFields } from '~/models/forms';
import { customServerLog } from '~/models/logger.server';
import { requireUserId } from '~/session.server';

export async function action({ request }: ActionArgs) {
  await requireUserId(request);
  try {
    const fields = await getRawFormFields(request);
    const result = AddRecordSchema.safeParse(fields);
    if (!result.success) {
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
        return prisma.area.create({
          data: { identifier: name },
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
        return prisma.city.create({
          data: { identifier: name },
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
        return prisma.group.create({
          data: { identifier: name },
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
        return prisma.licenseDetail.create({
          data: { identifier: name },
        });
      }
      if (result.data.recordType === 'License') {
        const { name, basicUsd } = result.data;
        return prisma.license.create({
          data: { identifier: name, basicUsd },
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
        return prisma.sector.create({
          data: { identifier: name },
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
        return prisma.status.create({
          data: { identifier: name },
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

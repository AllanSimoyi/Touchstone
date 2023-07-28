import { json, type ActionArgs } from '@remix-run/node';

import { prisma } from '~/db.server';
import {
  UpdateRecordSchema,
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
    const result = UpdateRecordSchema.safeParse(fields);
    if (!result.success) {
      return processBadRequest(result.error, fields);
    }

    if (result.data.recordType === 'Area') {
      const { id, name } = result.data;
      return prisma.area.update({
        where: { id },
        data: { identifier: name },
      });
    }
    if (result.data.recordType === 'City') {
      const { id, name } = result.data;
      return prisma.city.update({
        where: { id },
        data: { identifier: name },
      });
    }
    if (result.data.recordType === 'Group') {
      const { id, name } = result.data;
      return prisma.group.update({
        where: { id },
        data: { identifier: name },
      });
    }
    if (result.data.recordType === 'LicenseDetail') {
      const { id, name } = result.data;
      return prisma.licenseDetail.update({
        where: { id },
        data: { identifier: name },
      });
    }
    if (result.data.recordType === 'License') {
      const { id, name, basicUsd } = result.data;
      return prisma.license.update({
        where: { id },
        data: { identifier: name, basicUsd },
      });
    }
    if (result.data.recordType === 'Sector') {
      const { id, name } = result.data;
      return prisma.sector.update({
        where: { id },
        data: { identifier: name },
      });
    }
    if (result.data.recordType === 'Status') {
      const { id, name } = result.data;
      return prisma.status.update({
        where: { id },
        data: { identifier: name },
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

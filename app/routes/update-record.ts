import { json, type ActionArgs } from '@remix-run/node';

import { prisma } from '~/db.server';
import {
  UpdateRecordSchema,
  badRequest,
  processBadRequest,
} from '~/models/core.validations';
import { getErrorMessage } from '~/models/errors';
import { getRawFormFields } from '~/models/forms';
import { customServerLog, logParseError } from '~/models/logger.server';
import { requireUserId } from '~/session.server';

export async function action({ request }: ActionArgs) {
  await requireUserId(request);
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
      const updateResult = await prisma.area.update({
        where: { id },
        data: { identifier: name },
      });
      customServerLog('info', 'Updated area', result.data, request);
      return updateResult;
    }
    if (result.data.recordType === 'City') {
      const { id, name } = result.data;
      const updateResult = await prisma.city.update({
        where: { id },
        data: { identifier: name },
      });
      customServerLog('info', 'Updated city', result.data, request);
      return updateResult;
    }
    if (result.data.recordType === 'Group') {
      const { id, name } = result.data;
      const updateResult = await prisma.group.update({
        where: { id },
        data: { identifier: name },
      });
      customServerLog('info', 'Updated group', result.data, request);
      return updateResult;
    }
    if (result.data.recordType === 'LicenseDetail') {
      const { id, name } = result.data;
      const updateResult = await prisma.licenseDetail.update({
        where: { id },
        data: { identifier: name },
      });
      customServerLog('info', 'Updated licenseDetail', result.data, request);
      return updateResult;
    }
    if (result.data.recordType === 'License') {
      const { id, name, basicUsd } = result.data;
      const updateResult = await prisma.license.update({
        where: { id },
        data: { identifier: name, basicUsd },
      });
      customServerLog('info', 'Updated license', result.data, request);
      return updateResult;
    }
    if (result.data.recordType === 'Sector') {
      const { id, name } = result.data;
      const updateResult = await prisma.sector.update({
        where: { id },
        data: { identifier: name },
      });
      customServerLog('info', 'Updated sector', result.data, request);
      return updateResult;
    }
    if (result.data.recordType === 'Status') {
      const { id, name } = result.data;
      const updateResult = await prisma.status.update({
        where: { id },
        data: { identifier: name },
      });
      customServerLog('info', 'Updated status', result.data, request);
      return updateResult;
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

import { json, type ActionArgs } from '@remix-run/node';

import { prisma } from '~/db.server';
import {
  DeleteRecordSchema,
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
    const result = DeleteRecordSchema.safeParse(fields);
    if (!result.success) {
      logParseError(request, result.error, fields);
      return processBadRequest(result.error, fields);
    }
    const { id, recordType } = result.data;
    customServerLog('info', 'Input', result.data, request);

    const mapping: Record<typeof recordType, () => Promise<any>> = {
      Account: () => prisma.account.delete({ where: { id } }),
      Area: () => prisma.area.delete({ where: { id } }),
      City: () => prisma.city.delete({ where: { id } }),
      Database: () => prisma.database.delete({ where: { id } }),
      Event: () => prisma.event.delete({ where: { id } }),
      Group: () => prisma.group.delete({ where: { id } }),
      LicenseDetail: () => prisma.licenseDetail.delete({ where: { id } }),
      License: () => prisma.license.delete({ where: { id } }),
      Operator: () => prisma.operator.delete({ where: { id } }),
      Sector: () => prisma.sector.delete({ where: { id } }),
      Status: () => prisma.status.delete({ where: { id } }),
      User: () => prisma.user.delete({ where: { id } }),
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

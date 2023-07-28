import type { DataFunctionArgs } from '@remix-run/node';

import { json } from '@remix-run/node';
import { z } from 'zod';

import {
  RecordIdSchema,
  badRequest,
  processBadRequest,
} from '~/models/core.validations';
import { getRawFormFields } from '~/models/forms';
import { requireUserId } from '~/session.server';

import { getErrorMessage } from './errors';
import { customServerLog } from './logger.server';

const Schema = z.object({ id: RecordIdSchema });
export async function handleDeletingRecord(
  request: DataFunctionArgs['request'],
  dbOperation: (id: number) => Promise<void>
) {
  await requireUserId(request);
  try {
    const fields = await getRawFormFields(request);
    const result = Schema.safeParse(fields);
    if (!result.success) {
      return processBadRequest(result.error, fields);
    }
    const { id } = result.data;

    await dbOperation(id);

    return json({ success: true });
  } catch (error) {
    const formError =
      getErrorMessage(error) ||
      'Something went wrong deleting the record, please try again';
    customServerLog('error', formError, {}, request);
    return badRequest({ formError });
  }
}

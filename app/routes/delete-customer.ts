import type { ActionArgs } from '@remix-run/node';

import { json } from '@remix-run/node';
import { z } from 'zod';

import { prisma } from '~/db.server';
import { RecordIdSchema, processBadRequest } from '~/models/core.validations';
import { getRawFormFields } from '~/models/forms';
import { requireUserId } from '~/session.server';

const Schema = z.object({ id: RecordIdSchema });
export async function action({ request }: ActionArgs) {
  await requireUserId(request);

  const fields = await getRawFormFields(request);
  const result = Schema.safeParse(fields);
  if (!result.success) {
    return processBadRequest(result.error, fields);
  }
  const { id } = result.data;

  await prisma.account.delete({ where: { id } });

  return json({ success: true });
}

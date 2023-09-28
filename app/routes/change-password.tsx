import { json, type ActionArgs } from '@remix-run/node';

import { prisma } from '~/db.server';
import { createPasswordHash } from '~/models/auth.server';
import { badRequest, processBadRequest } from '~/models/core.validations';
import { getErrorMessage } from '~/models/errors';
import { getRawFormFields } from '~/models/forms';
import { customLog } from '~/models/logger';
import { customServerLog, logParseError } from '~/models/logger.server';
import { ChangePasswordSchema } from '~/models/user.validations';

export async function action({ request }: ActionArgs) {
  try {
    const fields = await getRawFormFields(request);
    const result = ChangePasswordSchema.safeParse(fields);
    if (!result.success) {
      logParseError(request, result.error, fields);
      return processBadRequest(result.error, fields);
    }
    const { id, password } = result.data;

    await prisma.user.update({
      where: { id },
      data: { password: await createPasswordHash(password) },
    });
    customLog('info', 'Password changed for user', { id });

    return json({ success: true });
    // return redirect(AppLinks.Users);
  } catch (error) {
    const formError =
      getErrorMessage(error) ||
      'Something went wrong changing user password, please try again';
    customServerLog('error', formError, {}, request);
    return badRequest({ formError });
  }
}

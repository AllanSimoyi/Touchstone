import { json, type ActionArgs } from '@remix-run/node';

import { prisma } from '~/db.server';
import { createPasswordHash, isValidPassword } from '~/models/auth.server';
import { badRequest, processBadRequest } from '~/models/core.validations';
import { getErrorMessage } from '~/models/errors';
import { getRawFormFields } from '~/models/forms';
import { customLog } from '~/models/logger';
import { customServerLog, logParseError } from '~/models/logger.server';
import { ChangeOwnPasswordSchema } from '~/models/user.validations';
import { requireUser } from '~/session.server';

export async function action({ request }: ActionArgs) {
  const currentUser = await requireUser(request);

  try {
    const fields = await getRawFormFields(request);
    const result = ChangeOwnPasswordSchema.safeParse(fields);
    if (!result.success) {
      logParseError(request, result.error, fields);
      return processBadRequest(result.error, fields);
    }
    const { currentPassword, newPassword } = result.data;

    const isValid = await isValidPassword(
      currentPassword,
      currentUser.password
    );
    if (!isValid) {
      return badRequest({
        fieldErrors: {
          currentPassword: ['Incorrect password, please try again'],
        },
      });
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: await createPasswordHash(newPassword) },
    });
    customLog('info', 'Password changed for current user', {
      id: currentUser.id,
    });

    return json({ success: true });
    // return redirect(AppLinks.Customers);
  } catch (error) {
    const formError =
      getErrorMessage(error) ||
      'Something went wrong changing your password, please try again';
    customServerLog('error', formError, {}, request);
    return badRequest({ formError });
  }
}

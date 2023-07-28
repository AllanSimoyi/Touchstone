import type { User } from '@prisma/client';

import { z } from 'zod';

import { ComposeRecordIdSchema } from './core.validations';
import { customLog } from './logger';

export const EmailSchema = z
  .string()
  .email()
  .min(4)
  .max(50)
  .transform((str) => str.toLowerCase().trim());

export const FullNameSchema = z.string().min(3).max(50);

export const ChangeOwnPasswordSchema = z
  .object({
    currentPassword: z
      .string({
        required_error: 'Enter your current password',
        invalid_type_error: 'Enter valid input for current password',
      })
      .min(1, 'Enter your current password')
      .transform((str) => str.trim()),
    newPassword: z
      .string({
        required_error: 'Enter your new password',
        invalid_type_error: 'Enter valid input for your new password',
      })
      .min(4, 'Enter your new password')
      .max(20, 'Use less than 20 characters for the new password')
      .transform((str) => str.trim()),
    reEnteredPassword: z
      .string({
        required_error: 'Re-enter your password',
        invalid_type_error:
          'Provide valid input when you re-enter your new password',
      })
      .min(4, 'Re-enter the password')
      .max(20, 'Use less than 20 characters for the re-entered password')
      .transform((str) => str.trim()),
  })
  .refine((data) => data.newPassword === data.reEnteredPassword, {
    message: "Passwords don't match",
    path: ['reEnteredPassword'],
  });

export const ChangePasswordSchema = z
  .object({
    id: ComposeRecordIdSchema('user'),
    password: z
      .string({
        required_error: 'Enter the new password',
        invalid_type_error: 'Enter valid input for the new password',
      })
      .min(4, 'Enter the password')
      .max(20, 'Use less than 20 characters for the password')
      .transform((str) => str.trim()),
    reEnteredPassword: z
      .string({
        required_error: 'Re-enter your password',
        invalid_type_error:
          'Provide valid input when you re-enter your new password',
      })
      .min(4, 'Re-enter the new password')
      .max(20, 'Use less than 20 characters when you re-enter the new password')
      .transform((str) => str.trim()),
  })
  .refine((data) => data.password === data.reEnteredPassword, {
    message: "Passwords don't match",
    path: ['reEnteredPassword'],
  });

export function parseRedirectUrl(url: string) {
  const DEFAULT_REDIRECT = '/';
  if (!url || typeof url !== 'string') {
    return DEFAULT_REDIRECT;
  }
  if (!url.startsWith('/') || url.startsWith('//')) {
    return DEFAULT_REDIRECT;
  }
  const redirectableUrls = ['/'];
  if (redirectableUrls.includes(url)) {
    return url;
  }
  return DEFAULT_REDIRECT;
}

export type CurrentUser = {
  id: number;
  username: string;
};

export function userToCurrentUser(user: User) {
  const currentUser: CurrentUser = {
    id: user.id,
    username: user.username,
  };
  return currentUser;
}

export const INVALID_ACCESS_LEVEL_ERR_MESSAGE =
  'Corrupted access level data found, please contact the system maintainers';

export const accessLevels = [
  'Level 1',
  'Level 2',
  'Level 3',
  'Level 4',
  'Level 5',
] as const;

export const AccessLevelSchema = z.enum(accessLevels, {
  errorMap: (issue) => {
    if (issue.code === 'invalid_type') {
      return {
        message: "Please select a valid level for the user's access level",
      };
    }
    return { message: "Please select the user's access level" };
  },
});
export type AccessLevel = z.infer<typeof AccessLevelSchema>;

export function getValidatedAccessLevel(data: unknown) {
  const result = AccessLevelSchema.safeParse(data);
  if (!result.success) {
    customLog('error', 'Invalid access level found', {
      data: JSON.stringify(data),
    });
    return undefined;
  }
  return result.data;
}

export function filterByValidAccessLevel<T extends { accessLevel: unknown }>(
  users: T[]
) {
  return users
    .map((user) => {
      const accessLevel = getValidatedAccessLevel(user.accessLevel);
      if (!accessLevel) {
        return undefined;
      }
      return { ...user, accessLevel };
    })
    .filter(Boolean);
}
//   ['Level 1', 'Administrator'],
//   ['Level 2', 'Update'],
//   ['Level 3', 'Update'],
//   ['Level 4', 'Read Only'],
//   ['Level 5', 'Read Only'],

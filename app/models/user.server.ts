import type { User } from '@prisma/client';

import { prisma } from '~/db.server';

import { createPasswordHash, isValidPassword } from './auth.server';
import {
  INVALID_ACCESS_LEVEL_ERR_MESSAGE,
  getValidatedAccessLevel,
  type AccessLevel,
} from './user.validations';

export type { User } from '@prisma/client';

export async function getUserById(id: User['id']) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return null;
  }
  const accessLevel = getValidatedAccessLevel(user.accessLevel);
  if (!accessLevel) {
    throw new Error(INVALID_ACCESS_LEVEL_ERR_MESSAGE);
  }
  return { ...user, accessLevel };
}

interface CreateUserProps {
  username: string;
  password: string;
  accessLevel: AccessLevel;
}
export async function createUser(props: CreateUserProps) {
  const { username, password, accessLevel } = props;

  return prisma.user.create({
    data: {
      username,
      password: await createPasswordHash(password),
      accessLevel,
    },
  });
}

export async function verifyLogin(
  username: User['username'],
  password: string
) {
  const userWithPassword = await prisma.user.findFirst({
    where: { username },
  });
  if (!userWithPassword) {
    return null;
  }

  const isValid = await isValidPassword(password, userWithPassword.password);
  if (!isValid) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = userWithPassword;
  return userWithoutPassword;
}

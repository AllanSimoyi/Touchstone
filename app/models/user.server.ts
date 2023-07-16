import type { User } from '@prisma/client';

import bcrypt from 'bcryptjs';

import { prisma } from '~/db.server';

import { createPasswordHash } from './auth.server';
import type { AccessLevel } from './user.validations';

export type { User } from '@prisma/client';

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id } });
}

interface CreateUserProps {
  username: string;
  password: string;
  accessLevel: AccessLevel;
}
export async function createUser(props: CreateUserProps) {
  const { username,  password, accessLevel } = props;

  return prisma.user.create({
    data: {
      username,
      password: await createPasswordHash(password),
      accessLevel,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    },
  });
}

export async function verifyLogin(username: User['username'], password: string) {
  const userWithPassword = await prisma.user.findFirst({
    where: { username },
  });
  if (!userWithPassword) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password
  );
  if (!isValid) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = userWithPassword;
  return userWithoutPassword;
}

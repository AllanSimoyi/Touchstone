// Use this to delete a user by their username
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/delete-user.ts username@example.com
// and that user will get deleted

import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { installGlobals } from '@remix-run/node';

import { prisma } from '~/db.server';

installGlobals();

async function deleteUser(username: string) {
  if (!username) {
    throw new Error('username required for login');
  }
  if (!username.endsWith('@example.com')) {
    throw new Error('All test usernames must end in @example.com');
  }

  try {
    await prisma.user.deleteMany({ where: { username } });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      console.log('User not found, so no need to delete');
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser(process.argv[2]);

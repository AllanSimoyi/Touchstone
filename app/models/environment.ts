import { z } from 'zod';

import { PresentStringSchema } from './core.validations';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  SESSION_SECRET: PresentStringSchema,
});

const result = EnvSchema.safeParse(process.env);
if (!result.success) {
  console.error('Env Var Errors:', result.error.flatten());
  process.exit(1);
}
export const Env = result.data;

import { z } from 'zod';

const AccessLevelSchema = z.enum([
  'Level 1',
  'Level 2',
  'Level 3',
  'Level 4',
  'Level 5',
]);
export type AccessLevel = z.infer<typeof AccessLevelSchema>;

//   ['Level 1', 'Administrator'],
//   ['Level 2', 'Update'],
//   ['Level 3', 'Update'],
//   ['Level 4', 'Read Only'],
//   ['Level 5', 'Read Only'],

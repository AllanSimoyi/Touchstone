import type { ActionData } from './forms';
import type { ZodError } from 'zod';

import { json } from '@remix-run/server-runtime';
import { z } from 'zod';

import { fieldErrorsToArr } from './forms';

export enum ResponseMessage {
  Unauthorised = "You're not authorised to access this resource",
  InvalidId = 'Invalid ID provided',
  RecordNotFound = 'Record not found',
  DeletedRecord = 'Record was deleted',
  InvalidMethod = 'Invalid request method provided',
}

export enum StatusCode {
  BadRequest = 400,
  Unauthorised = 401,
  Forbidden = 403,
  NotFound = 404,
}

export const INVALID_VALUES_FROM_SERVER =
  'Received invalid values from server, please contact the system maintainers';

export function containsNumbers(str: string) {
  return Boolean(str.match(/\d/));
}

export const CleanPositiveIntSchema = z
  .number({
    invalid_type_error: 'Provide a valid number',
    required_error: 'Provide a number',
  })
  .int({ message: 'Enter a whole number (integer)' })
  .positive({ message: 'Enter a positive number' });
export const StringNumber = z
  .string({
    invalid_type_error: 'Provide a valid number',
    required_error: 'Provide a number',
  })
  .regex(/\d+/, { message: 'Enter a valid number' })
  .transform(Number);
export const PresentStringSchema = z
  .string({
    invalid_type_error: 'Provide a valid string',
    required_error: 'Provide a string',
  })
  .min(1, { message: 'Use at least 1 character for the string' });

export const PositiveDecimalSchema = z
  .number({
    invalid_type_error: 'Provide a valid number',
    required_error: 'Provide a number',
  })
  .positive({ message: 'Enter a positive' })
  .or(StringNumber)
  .refine((n) => n > 0);

export const PerhapsZeroDecimalSchema = z
  .number({
    invalid_type_error: 'Provide a valid number',
    required_error: 'Provide a number',
  })
  .min(0, { message: 'Provide a number' })
  .or(StringNumber)
  .refine((n) => n >= 0);

export const PerhapsZeroIntSchema = z
  .number({
    invalid_type_error: 'Provide a valid number',
  })
  .int({ message: 'Enter a whole number (integer)' })
  .min(0)
  .or(StringNumber)
  .refine((n) => n >= 0);

export const PositiveIntSchema = z
  .number({
    invalid_type_error: 'Provide a valid number',
    required_error: 'Provide a number',
  })
  .int({ message: 'Enter a whole number (integer)' })
  .min(1, { message: 'Provide a number' })
  .or(StringNumber)
  .refine((n) => n > 0);

export const OptionalRecordIdSchema = z
  .number({
    invalid_type_error: 'Provide a valid record ID',
    required_error: 'Provide a record ID',
  })
  .int({ message: 'Provide an valid record ID' })
  .or(StringNumber)
  .refine((n) => n === 0 || n > 0);

export const RecordIdSchema = z
  .number({
    invalid_type_error: 'Provide a valid record ID',
    required_error: 'Provide a record ID',
  })
  .int({ message: 'Provide an valid record ID' })
  .min(1, { message: 'Provide a valid record ID' })
  .or(StringNumber)
  .refine((n) => n > 0);

export function ComposeOptionalRecordIdSchema(identifier: string) {
  return z
    .number({
      invalid_type_error: `Select a valid ${identifier}`,
      required_error: `Select a ${identifier}`,
    })
    .int({ message: `Select a valid ${identifier}` })
    .or(StringNumber)
    .refine((n) => n === 0 || n > 0);
}

export function ComposeRecordIdSchema(identifier: string) {
  return z
    .number({
      invalid_type_error: `Select a valid ${identifier}`,
      required_error: `Select a ${identifier}`,
    })
    .int({ message: `Select a valid ${identifier}` })
    .min(1, { message: `Select a valid ${identifier}` })
    .or(StringNumber)
    .refine((n) => n > 0);
}

export const DateSchema = z.preprocess(
  (arg) => {
    if (typeof arg == 'string' || arg instanceof Date) {
      return new Date(arg);
    }
  },
  z.date({
    invalid_type_error: 'Provide a valid date',
    required_error: 'Provide a date',
  })
);

export const BooleanSchema = z.preprocess(
  (arg) => {
    if (typeof arg === 'string') {
      return arg === 'true';
    }
  },
  z.boolean({
    invalid_type_error: 'Provide a valid boolean (yes/no)',
    required_error: 'Provide yes/no input',
  })
);

export function hasSuccess(data: unknown): data is { success: boolean } {
  return typeof data === 'object' && data !== null && 'success' in data;
}

export type Result<Ok, Err> =
  | { success: true; data: Ok }
  | { success: false; err: Err };

export function stringifyZodError(zodError: ZodError) {
  const { fieldErrors, formErrors } = zodError.flatten();
  const allErrors = [...(fieldErrorsToArr(fieldErrors) || []), ...formErrors];
  return allErrors.join(', ');
}

export function getValidatedId(rawId: any) {
  const result = RecordIdSchema.safeParse(rawId);
  if (!result.success) {
    throw new Response(ResponseMessage.InvalidId, {
      status: StatusCode.BadRequest,
    });
  }
  return result.data;
}

export function badRequest(data: ActionData) {
  return json(data, { status: 400 });
}

export function processBadRequest<DataType>(
  zodError: z.ZodError<DataType>,
  fields: any
) {
  const { formErrors, fieldErrors } = zodError.flatten();
  return badRequest({
    fields,
    fieldErrors,
    formError: formErrors.join(', '),
  });
}

export function getQueryParams<T extends string>(url: string, params: T[]) {
  const urlObj = new URL(url);
  return params.reduce(
    (acc, param) => ({
      ...acc,
      [param]: urlObj.searchParams.get(param) || undefined,
    }),
    {} as Record<T, string | undefined>
  );
}

export const RECORD_TYPES = [
  'Account',
  'Area',
  'City',
  'Database',
  'Event',
  'Group',
  'LicenseDetail',
  'License',
  'Operator',
  'Sector',
  'Status',
  'User',
] as const;

const NameSchema = z
  .string({
    required_error: "Please enter the area's name",
    invalid_type_error: "Please provide valid input for the area's name",
  })
  .min(1, "Please enter the area's name first")
  .max(100, "Please use less than 200 characters for the area's name");

const BasicUsdSchema = z.coerce
  .number({
    required_error: 'Enter the basic USD for the license',
    invalid_type_error: 'Provide valid input for the license basic USD',
  })
  .min(0, 'Enter a minimum of 0 for the license basic USD')
  .transform((arg) => arg.toFixed(2))
  .transform((arg) => Number(arg));

export const AddAreaSchema = z.object({
  recordType: z.literal('Area'),
  name: NameSchema,
});

export const AddGroupSchema = z.object({
  recordType: z.literal('Group'),
  name: NameSchema,
});

export const AddCitySchema = z.object({
  recordType: z.literal('City'),
  name: NameSchema,
});

export const AddLicenseSchema = z.object({
  recordType: z.literal('License'),
  name: NameSchema,
  basicUsd: BasicUsdSchema,
});

export const AddLicenseDetailSchema = z.object({
  recordType: z.literal('LicenseDetail'),
  name: NameSchema,
});

export const AddSectorSchema = z.object({
  recordType: z.literal('Sector'),
  name: NameSchema,
});
export const AddStatusSchema = z.object({
  recordType: z.literal('Status'),
  name: NameSchema,
});

export const AddRecordSchema = z.discriminatedUnion('recordType', [
  AddAreaSchema,
  AddCitySchema,
  AddGroupSchema,
  AddLicenseDetailSchema,
  AddLicenseSchema,
  AddSectorSchema,
  AddStatusSchema,
]);

export const UpdateAreaSchema = z.object({
  recordType: z.literal('Area'),
  id: RecordIdSchema,
  name: NameSchema,
});

export const UpdateCitySchema = z.object({
  recordType: z.literal('City'),
  id: RecordIdSchema,
  name: NameSchema,
});

export const UpdateGroupSchema = z.object({
  recordType: z.literal('Group'),
  id: RecordIdSchema,
  name: NameSchema,
});

export const UpdateLicenseSchema = z.object({
  recordType: z.literal('License'),
  id: RecordIdSchema,
  name: NameSchema,
  basicUsd: BasicUsdSchema,
});

export const UpdateLicenseDetailSchema = z.object({
  recordType: z.literal('LicenseDetail'),
  id: RecordIdSchema,
  name: NameSchema,
});

export const UpdateSectorSchema = z.object({
  recordType: z.literal('Sector'),
  id: RecordIdSchema,
  name: NameSchema,
});
export const UpdateStatusSchema = z.object({
  recordType: z.literal('Status'),
  id: RecordIdSchema,
  name: NameSchema,
});

export const UpdateRecordSchema = z.discriminatedUnion('recordType', [
  UpdateAreaSchema,
  UpdateCitySchema,
  UpdateGroupSchema,
  UpdateLicenseDetailSchema,
  UpdateLicenseSchema,
  UpdateSectorSchema,
  UpdateStatusSchema,
]);

export const DeleteRecordSchema = z.object({
  id: RecordIdSchema,
  recordType: z.enum(RECORD_TYPES, {
    errorMap: (_) => ({
      message: 'Specify the type of record you wish to delete',
    }),
  }),
});

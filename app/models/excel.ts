import type { ZodTypeAny } from 'zod';

import { z } from 'zod';

import {
  BasicUsdSchema,
  ComposeIdentifierSchema,
  stringifyZodError,
} from './core.validations';

export function parseRowCell<T extends ZodTypeAny>(
  row: string[],
  titleAndSchemaIndex: number,
  Schema: T,
  errorMessage: string
) {
  if (titleAndSchemaIndex < 0) {
    return new Error(errorMessage);
  }
  const cell = row[titleAndSchemaIndex] || undefined;
  if (!cell) {
    return new Error(errorMessage);
  }
  const result = Schema.safeParse(cell);
  if (!result.success) {
    return new Error(stringifyZodError(result.error));
  }
  return result.data as T['_output'];
}

const CompanyNameSchema = z
  .string({ required_error: "Enter the company's name" })
  .min(1, "Enter the company's name")
  .max(50, "Use less than 50 characters for the company's name");
const AccountNumberSchema = z
  .string({ required_error: 'Enter the account number' })
  .min(1, 'Enter the account number')
  .max(20, 'Use less than 20 characters for the account number');
const TradingAsSchema = z
  .string()
  .max(50, 'Use less than 50 characters for the name')
  .or(z.undefined());
const FormerlySchema = z
  .string()
  .max(50, "Use less than 50 characters for the company's former name")
  .or(z.undefined());
const CeoNameSchema = z
  .string()
  .max(50, "Use less than 50 characters for the CEO's name");
const CeoEmailSchema = z
  .string()
  .email('Enter a valid email for CEO')
  .max(50, "Use less than 50 characters for the CEO's email");
const CeoPhoneSchema = z
  .string()
  .max(20, "Use less than 20 characters for the CEO's phone number")
  .or(z.number().transform(String));
const CeoFaxSchema = z
  .string()
  .max(50, "Use less than 50 characters for the CEO's fax number")
  .or(z.undefined());
const AddrSchema = z
  .string()
  .max(500, 'Use less than 500 characters for the physical address');
const TelSchema = z
  .string()
  .max(20, 'Use less than 20 characters for the telephone number');
const FaxSchema = z
  .string()
  .max(20, 'Use less than 20 characters for the fax number');
const CellSchema = z
  .string()
  .max(20, 'Use less than 20 characters for the cellphone number');
const LicenseSchema = z.preprocess((arg) => {
  try {
    const result = z.coerce.string().safeParse(arg);
    if (!result.success) {
      throw new Error();
    }
    return result.data;
  } catch (error) {
    return undefined;
  }
}, ComposeIdentifierSchema('license').or(z.undefined()));
const LicenseDetailSchema = ComposeIdentifierSchema('license detail');
const AddedPercentageSchema = z.coerce
  .number()
  .int('Enter an integer for the added percentage')
  .max(100, 'Enter an added percentage less than 100')
  .or(z.undefined());
const ContractNumberSchema = z
  .string()
  .max(30, 'Use less than 30 characters for the contract number');
const DateOfContractSchema = z.preprocess((arg) => {
  try {
    const result = z.coerce.date().safeParse(arg);
    if (!result.success) {
      throw new Error();
    }
    return result.data;
  } catch (error) {
    return undefined;
  }
}, z.date().or(z.undefined()));
// const DateOfContractSchema = z.coerce
// .date()
// .or(z.undefined())
// .or(z.literal('').transform((arg) => undefined));
const AccountantNameSchema = z
  .string()
  .max(50, "Use less than 20 characters for the accountant's name");
const AccountantEmailSchema = z
  .string()
  // .email('Enter a valid email for the accountant')
  .max(50, "Use less than 50 characters for the accountant's email");
const GroupSchema = ComposeIdentifierSchema('group');
const AreaSchema = ComposeIdentifierSchema('area');
const SectorSchema = ComposeIdentifierSchema('sector');
const VatNumberSchema = z
  .string()
  .max(20, 'Use less than 20 characters for the VAT number')
  .or(z.undefined());
const OtherNamesSchema = z
  .string()
  .max(200, 'Use less than 200 characters for the other names used on cheques')
  .or(z.undefined());
const DescriptionSchema = z
  .string()
  .max(1600, 'Use less than 1600 characters for the description');
const ActualSchema = z.coerce
  .number({ invalid_type_error: "Enter a number for 'Actual" })
  .int("Enter a whole number for 'Actual'")
  .or(z.literal('').transform((_) => 0));
const ReasonSchema = z
  .string()
  .max(500, 'Use less than 500 characters for the reason')
  .or(z.undefined());
const StatusSchema = ComposeIdentifierSchema('status');
const CommentSchema = z
  .string()
  .max(1600, 'Use less than 1600 characters for the comment')
  .or(z.undefined());
const BoxCitySchema = ComposeIdentifierSchema('box city');
const BoxNumberSchema = z
  .string()
  .max(200, 'Use less than 200 characters for the box number');
const BoxAreaSchema = z
  .string()
  .max(200, 'Use less than 200 characters for the box area');
const DeliveryCitySchema = ComposeIdentifierSchema('delivery city');
const DeliverySuburbSchema = z
  .string()
  .max(100, 'Use less than 100 characters for the delivery suburbs');
const DeliveryAddressSchema = z
  .string()
  .max(100, 'Use less than 100 characters for the delivery address');
const DatabasesSchema = z
  .string({
    required_error: 'Provide the database',
    invalid_type_error: 'Provide valid input for the database',
  })
  .min(1, 'Enter the database name')
  .max(50, 'Use less than 50 characters for database name');
const OperatorNameSchema = z
  .string({
    required_error: 'Provide the operator name',
    invalid_type_error: "Provide valid input for the operator's name",
  })
  .min(1, "Enter the operator's name")
  .max(50, "Use less than 50 characters for operator's name")
  .or(z.undefined());
const OperatorEmailSchema = z
  .string({
    required_error: "Provide the operator's email",
    invalid_type_error: "Provide valid input for the operator's email",
  })
  .email({ message: 'Provide a valid email for the operator' })
  .min(1, "Enter the operator's email")
  .max(50, "Use less than 50 characters for operator's email")
  .or(z.undefined());
export const ExcelRowSchema = z.tuple(
  [
    AccountNumberSchema,
    CompanyNameSchema,
    TradingAsSchema,
    FormerlySchema,
    GroupSchema,
    AreaSchema,
    SectorSchema,
    VatNumberSchema,
    OtherNamesSchema,
    DescriptionSchema,
    ActualSchema,
    ReasonSchema,
    StatusSchema,
    ContractNumberSchema,
    DateOfContractSchema,
    LicenseSchema,
    BasicUsdSchema,
    LicenseDetailSchema,
    AddedPercentageSchema,
    CommentSchema,
    CeoNameSchema,
    CeoEmailSchema,
    CeoPhoneSchema,
    CeoFaxSchema,
    AddrSchema,
    TelSchema,
    FaxSchema,
    CellSchema,
    AccountantNameSchema,
    AccountantEmailSchema,
    BoxCitySchema,
    BoxNumberSchema,
    BoxAreaSchema,
    DeliveryCitySchema,
    DeliveryAddressSchema,
    DeliverySuburbSchema,
    DatabasesSchema,
    OperatorNameSchema,
    OperatorEmailSchema,
  ],
  { required_error: 'Please provide row data' }
);
export type ParsedExcelRow = z.infer<typeof ExcelRowSchema>;

export const EXCEL_TABLE_COLUMNS = [
  ['Account #', AccountNumberSchema] as const,
  ['Company Name', CompanyNameSchema] as const,
  ['Trading As', TradingAsSchema] as const,
  ['Formerly', FormerlySchema] as const,
  ['Group', GroupSchema] as const,
  ['Area', AreaSchema] as const,
  ['Sector', SectorSchema] as const,
  ['Vat #', VatNumberSchema] as const,
  ['Other Names On Cheques', OtherNamesSchema] as const,
  ['Description', DescriptionSchema] as const,
  ['Actual', ActualSchema] as const,
  ['Reason', ReasonSchema] as const,
  ['Status', StatusSchema] as const,
  ['Contract #', ContractNumberSchema] as const,
  ['Contract Date', DateOfContractSchema] as const,
  ['License', LicenseSchema] as const,
  ['License Basic USD', BasicUsdSchema] as const,
  ['License Detail', LicenseDetailSchema] as const,
  ['Added %', AddedPercentageSchema] as const,
  ['Comment', CommentSchema] as const,
  ['Ceo Name', CeoNameSchema] as const,
  ['Ceo Email', CeoEmailSchema] as const,
  ['Ceo Phone', CeoPhoneSchema] as const,
  ['Ceo Fax', CeoFaxSchema] as const,
  ['Address', AddrSchema] as const,
  ['Tel', TelSchema] as const,
  ['Fax', FaxSchema] as const,
  ['Cell', CellSchema] as const,
  ['Accountant Name', AccountantNameSchema] as const,
  ['Accountant Email', AccountantEmailSchema] as const,
  ['Box City', BoxCitySchema] as const,
  ['Box #', BoxNumberSchema] as const,
  ['Box Area', BoxAreaSchema] as const,
  ['Delivery City', DeliveryCitySchema] as const,
  ['Delivery Address', DeliveryAddressSchema] as const,
  ['Delivery Suburb', DeliverySuburbSchema] as const,
  ['Databases', DatabasesSchema] as const,
  ['Operator', OperatorNameSchema] as const,
  ['Operator Email', OperatorEmailSchema] as const,
] as const;

// 3 undefined
// 7 undefined
// 8 undefined
// 11 undefined
// 18 undefined
// 19 undefined
// 23 undefined
// 37 undefined
// 38 undefined

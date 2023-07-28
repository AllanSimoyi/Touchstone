import type { ActionArgs, LoaderArgs } from '@remix-run/node';

import { Response, json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { z } from 'zod';

import {
  ActionContextProvider,
  useForm,
} from '~/components/ActionContextProvider';
import { AddEditDatabases } from '~/components/AddEditDatabases';
import { AddEditOperators } from '~/components/AddEditOperators';
import { RouteErrorBoundary } from '~/components/Boundaries';
import { Card } from '~/components/Card';
import { CardHeader } from '~/components/CardHeader';
import { CenteredView } from '~/components/CenteredView';
import { Footer } from '~/components/Footer';
import { FormSelect } from '~/components/FormSelect';
import { FormTextArea } from '~/components/FormTextArea';
import { FormTextField } from '~/components/FormTextField';
import { InlineAlert } from '~/components/InlineAlert';
import { PrimaryButton } from '~/components/PrimaryButton';
import { Toolbar } from '~/components/Toolbar';
import { prisma } from '~/db.server';
import {
  ComposeOptionalRecordIdSchema,
  RecordIdSchema,
  StatusCode,
  badRequest,
  getValidatedId,
  processBadRequest,
} from '~/models/core.validations';
import { calcGross, calcNet, calcVat } from '~/models/customers';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import { getErrorMessage } from '~/models/errors';
import {
  fieldErrorsToArr,
  getFieldErrors,
  getRawFormFields,
  hasFields,
  hasFormError,
} from '~/models/forms';
import { AppLinks } from '~/models/links';
import { logParseError } from '~/models/logger.server';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);

  const id = getValidatedId(params.id);

  const records = await Promise.all([
    prisma.account
      .findUnique({
        where: { id },
        select: {
          id: true,
          companyName: true,
          accountNumber: true,
          tradingAs: true,
          formerly: true,
          groupId: true,
          areaId: true,
          sectorId: true,
          vat: true,
          otherNames: true,
          actual: true,
          reason: true,
          statusId: true,
          boxNumber: true,
          boxArea: true,
          boxCityId: true,
          deliveryCityId: true,
          deliveryAddress: true,
          deliverySuburb: true,
          description: true,
          comment: true,
          contractNumber: true,
          dateOfContract: true,
          licenseId: true,
          licenseDetailId: true,
          addedPercentage: true,
          gross: true,
          net: true,
          vatNumber: true,
          accountantName: true,
          accountantEmail: true,
          physicalAddress: true,
          telephoneNumber: true,
          faxNumber: true,
          cellphoneNumber: true,
          ceoName: true,
          ceoEmail: true,
          ceoPhone: true,
          ceoFax: true,
          databases: { select: { id: true, databaseName: true } },
          operators: {
            select: { id: true, operatorName: true, operatorEmail: true },
          },
        },
      })
      .then((customer) => {
        if (!customer) {
          return null;
        }
        const { dateOfContract, ...restOfCustomer } = customer;
        return {
          ...restOfCustomer,
          dateOfContract: dateOfContract
            ? dayjs(dateOfContract).format(DATE_INPUT_FORMAT)
            : undefined,
        };
      }),
    prisma.city.findMany({
      select: { id: true, identifier: true },
    }),
    prisma.status.findMany({
      select: { id: true, identifier: true },
    }),
    prisma.group.findMany({
      select: { id: true, identifier: true },
    }),
    prisma.area.findMany({
      select: { id: true, identifier: true },
    }),
    prisma.sector.findMany({
      select: { id: true, identifier: true },
    }),
    prisma.license.findMany({
      select: { id: true, identifier: true, basicUsd: true },
    }),
    prisma.licenseDetail.findMany({
      select: { id: true, identifier: true },
    }),
  ]);
  const [
    account,
    cities,
    statuses,
    groups,
    areas,
    sectors,
    licenses,
    licenseDetails,
  ] = records;

  if (!account) {
    throw new Response('Account record not found', {
      status: StatusCode.NotFound,
    });
  }

  return json({
    account,
    cities,
    statuses,
    groups,
    areas,
    sectors,
    licenses,
    licenseDetails,
  });
}

const Schema = z.object({
  id: RecordIdSchema,
  companyName: z
    .string()
    .min(1, "Enter the company's name")
    .max(50, "Use less than 50 characters for the company's name"),
  accountNumber: z
    .string()
    .min(1, 'Enter the account number')
    .max(20, 'Use less than 20 characters for the account number'),
  tradingAs: z.string().max(50, 'Use less than 50 characters for the name'),
  formerly: z
    .string()
    .max(50, "Use less than 50 characters for the company's former name"),
  ceoName: z.string().max(50, "Use less than 50 characters for the CEO's name"),
  ceoEmail: z
    .string()
    .email('Enter a valid email for CEO')
    .max(50, "Use less than 50 characters for the CEO's email"),
  ceoPhone: z
    .string()
    .max(20, "Use less than 20 characters for the CEO's phone number"),
  ceoFax: z
    .string()
    .max(50, "Use less than 50 characters for the CEO's fax number"),
  addr: z
    .string()
    .max(500, 'Use less than 500 characters for the physical address'),
  tel: z
    .string()
    .max(20, 'Use less than 20 characters for the telephone number'),
  fax: z.string().max(20, 'Use less than 20 characters for the fax number'),
  cell: z
    .string()
    .max(20, 'Use less than 20 characters for the cellphone number'),
  licenseId: ComposeOptionalRecordIdSchema('license'),
  licenseDetailId: ComposeOptionalRecordIdSchema('license detail record'),
  addedPercentage: z.coerce
    .number()
    .int('Enter an integer for the added percentage')
    .max(100, 'Enter an added percentage less than 100'),
  contractNumber: z
    .string()
    .max(30, 'Use less than 30 characters for the contract number'),
  dateOfContract: z.coerce.date().or(z.literal('').transform((_) => undefined)),
  accountantName: z
    .string()
    .max(20, "Use less than 20 characters for the accountant's name"),
  accountantEmail: z
    .string()
    .email('Enter a valid email for the accountant')
    .max(50, "Use less than 50 characters for the accountant's email"),
  groupId: ComposeOptionalRecordIdSchema('group'),
  areaId: ComposeOptionalRecordIdSchema('area'),
  sectorId: ComposeOptionalRecordIdSchema('sector'),
  vatNumber: z
    .string()
    .max(20, 'Use less than 20 characters for the VAT number'),
  otherNames: z
    .string()
    .max(
      200,
      'Use less than 200 characters for the other names used on cheques'
    ),
  description: z
    .string()
    .max(1600, 'Use less than 1600 characters for the description'),
  actual: z.coerce
    .number({ invalid_type_error: "Enter a number for 'Actual" })
    .int("Enter a whole number for 'Actual'")
    .or(z.literal('').transform((_) => 0)),
  reason: z.string().max(500, 'Use less than 500 characters for the reason'),
  statusId: ComposeOptionalRecordIdSchema('status'),
  comment: z
    .string()
    .max(1600, 'Use less than 1600 characters for the comment'),
  boxCityId: ComposeOptionalRecordIdSchema('box city'),
  boxNumber: z
    .string()
    .max(200, 'Use less than 200 characters for the box number'),
  boxArea: z.string().max(200, 'Use less than 200 characters for the box area'),
  deliveryCityId: ComposeOptionalRecordIdSchema('delivery city'),
  deliverySuburb: z
    .string()
    .max(100, 'Use less than 100 characters for the delivery suburbs'),
  deliveryAddress: z
    .string()
    .max(100, 'Use less than 100 characters for the delivery address'),
  databases: z.preprocess((arg) => {
    if (typeof arg === 'string') {
      return JSON.parse(arg);
    }
  }, z.array(z.string().min(1, 'Enter the database name').max(50, 'Use less than 50 characters for database name'))),
  operators: z.preprocess(
    (arg) => {
      if (typeof arg === 'string') {
        return JSON.parse(arg);
      }
    },
    z.array(
      z.object({
        name: z
          .string()
          .min(1, "Enter the operator's name")
          .max(50, "Use less than 50 characters for operator's name"),
        email: z
          .string()
          .email()
          .min(1, "Enter the operator's email")
          .max(50, "Use less than 50 characters for operator's email"),
      })
    )
  ),
});
export const action = async ({ request }: ActionArgs) => {
  await requireUserId(request);

  try {
    const fields = await getRawFormFields(request);
    const result = Schema.safeParse(fields);
    if (!result.success) {
      logParseError(request, result.error, fields);
      return processBadRequest(result.error, fields);
    }
    const {
      id,
      accountNumber,
      contractNumber,
      companyName,
      tradingAs,
      formerly,
    } = result.data;
    const { groupId, areaId, sectorId, vatNumber, otherNames } = result.data;
    const { description, actual, reason, statusId } = result.data;
    const { dateOfContract, licenseId, licenseDetailId } = result.data;
    const { addedPercentage, comment } = result.data;
    const { accountantName, accountantEmail } = result.data;
    const { boxCityId, boxNumber, boxArea } = result.data;
    const { ceoName, ceoEmail, ceoPhone, ceoFax } = result.data;
    const { addr, tel, fax, cell } = result.data;
    const { databases, operators } = result.data;
    const { deliveryAddress, deliverySuburb, deliveryCityId } = result.data;

    const [accNumDuplicates, contractNumDuplicates] = await Promise.all([
      prisma.account.count({
        where: { accountNumber, id: { not: id } },
      }),
      contractNumber
        ? prisma.account.count({ where: { contractNumber, id: { not: id } } })
        : undefined,
    ]);
    if (accNumDuplicates) {
      return badRequest({
        fieldErrors: {
          accountNumber: ['An account with that account number already exists'],
        },
      });
    }
    if (contractNumDuplicates) {
      return badRequest({
        fieldErrors: {
          contractNumber: [
            'An account with that contract number already exists',
          ],
        },
      });
    }

    const license = await prisma.license.findUnique({
      where: { id: licenseId },
      select: { basicUsd: true },
    });
    if (!license) {
      return badRequest({
        formError:
          "Couldn't find the license record you selected, please contact the system maintainers",
      });
    }

    const gross = calcGross({
      basicUsd: license.basicUsd,
      addedPercentage,
      numDatabases: databases.length,
    });

    await prisma.$transaction([
      prisma.account.update({
        where: { id },
        select: { id: true },
        data: {
          accountNumber,
          companyName,
          tradingAs,
          formerly,
          groupId,
          areaId,
          sectorId,
          vatNumber,
          otherNames,
          description,
          actual,
          reason,
          statusId,
          contractNumber,
          dateOfContract,
          licenseId,
          licenseDetailId,
          addedPercentage,
          gross,
          net: calcNet(gross),
          vat: calcVat(gross),
          comment,
          accountantName,
          accountantEmail,
          boxCityId,
          boxNumber,
          boxArea,
          ceoName,
          ceoEmail,
          ceoPhone,
          ceoFax,
          physicalAddress: addr,
          telephoneNumber: tel,
          faxNumber: fax,
          cellphoneNumber: cell,
          deliveryAddress,
          deliverySuburb,
          deliveryCityId,
        },
      }),
      prisma.database.deleteMany({
        where: { accountId: id },
      }),
      prisma.database.createMany({
        data: databases.map((databaseName) => ({
          accountId: id,
          databaseName,
        })),
      }),
      prisma.operator.deleteMany({
        where: { accountId: id },
      }),
      prisma.operator.createMany({
        data: operators.map(({ name, email }) => ({
          accountId: id,
          operatorName: name,
          operatorEmail: email,
        })),
      }),
    ]);

    return redirect(AppLinks.Customer(id));
  } catch (error) {
    const formError =
      getErrorMessage(error) ||
      'Something went wrong updating customer, please try again';
    return badRequest({ formError });
  }
};

export default function EditCustomerPage() {
  const user = useUser();
  const {
    account,
    cities,
    statuses,
    groups,
    areas,
    sectors,
    licenses,
    licenseDetails,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { getNameProp, isProcessing } =
    useForm<keyof z.infer<typeof Schema>>(actionData);

  const defaultValues: Record<keyof z.infer<typeof Schema>, string> = {
    id: account.id.toString(),
    companyName: account.companyName,
    accountNumber: account.accountNumber,
    tradingAs: account.tradingAs,
    formerly: account.formerly,
    ceoName: account.ceoName || '',
    ceoEmail: account.ceoEmail || '',
    ceoPhone: account.ceoPhone || '',
    ceoFax: account.ceoFax || '',
    addr: account.physicalAddress || '',
    tel: account.telephoneNumber || '',
    fax: account.faxNumber || '',
    cell: account.cellphoneNumber || '',
    licenseId: account.licenseId.toString(),
    licenseDetailId: account.licenseDetailId.toString(),
    addedPercentage: account.addedPercentage.toFixed(),
    contractNumber: account.contractNumber,
    dateOfContract: dayjs(account.dateOfContract).format(DATE_INPUT_FORMAT),
    accountantName: account.accountantName || '',
    accountantEmail: account.accountantEmail || '',
    groupId: account.groupId.toString(),
    areaId: account.areaId.toString(),
    sectorId: account.sectorId.toString(),
    vatNumber: account.vatNumber,
    otherNames: account.otherNames,
    description: account.description,
    actual: account.actual.toString(),
    reason: account.reason,
    statusId: account.statusId.toString(),
    comment: account.comment,
    boxCityId: account.boxCityId.toString() || '',
    boxNumber: account.boxNumber || '',
    boxArea: account.boxArea || '',
    deliveryCityId: account.deliveryCityId.toString() || '',
    deliverySuburb: account.deliverySuburb || '',
    deliveryAddress: account.deliveryAddress || '',
    databases: JSON.stringify(
      account.databases.map((database) => database.databaseName)
    ),
    operators: JSON.stringify(
      account.operators.map((operator) => ({
        name: operator.operatorName,
        email: operator.operatorEmail,
      }))
    ),
  };

  const fieldErrors = useMemo(() => getFieldErrors(actionData), [actionData]);

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <Form method="post" className="flex grow flex-col items-stretch py-6">
        <ActionContextProvider
          {...actionData}
          fields={hasFields(actionData) ? actionData.fields : defaultValues}
          isSubmitting={isProcessing}
        >
          <CenteredView className="w-full gap-4 px-2">
            <input type="hidden" name="id" value={account.id} />
            <div className="flex flex-col items-start justify-center pt-2">
              <span className="text-base font-semibold">
                Update Customer Details
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>Identification Details</CardHeader>
                <div className="flex flex-col items-stretch gap-2 p-2">
                  <FormTextField
                    {...getNameProp('companyName')}
                    label="Company Name"
                  />
                  <FormTextField
                    {...getNameProp('accountNumber')}
                    label="Account #"
                  />
                  <FormTextField
                    {...getNameProp('tradingAs')}
                    label="Trading As"
                  />
                  <FormTextField
                    {...getNameProp('formerly')}
                    label="Formerly"
                  />
                </div>
              </Card>
              <Card>
                <CardHeader>CEO Details</CardHeader>
                <div className="flex flex-col items-stretch gap-2 p-2">
                  <FormTextField
                    {...getNameProp('ceoName')}
                    label="CEO's Name"
                  />
                  <FormTextField
                    {...getNameProp('ceoEmail')}
                    label="CEO's Email"
                  />
                  <FormTextField
                    {...getNameProp('ceoPhone')}
                    label="CEO's Phone #"
                  />
                  <FormTextField
                    {...getNameProp('ceoFax')}
                    label="CEO's Fax #"
                  />
                </div>
              </Card>
              <Card>
                <CardHeader>Contact Details</CardHeader>
                <div className="flex flex-col items-stretch gap-2 p-2">
                  <FormTextField
                    {...getNameProp('addr')}
                    label="Physical Address"
                  />
                  <FormTextField
                    {...getNameProp('tel')}
                    label="Telephone Number"
                  />
                  <FormTextField {...getNameProp('fax')} label="Fax Number" />
                  <FormTextField
                    {...getNameProp('cell')}
                    label="Cellphone Number"
                  />
                </div>
              </Card>
              <div className="flex flex-col items-stretch gap-6">
                <Card>
                  <CardHeader>License Details</CardHeader>
                  <div className="flex flex-col items-stretch gap-2 p-2">
                    <FormSelect {...getNameProp('licenseId')} label="License">
                      <option value="">NONE</option>
                      {licenses.map((license) => (
                        <option key={license.id} value={license.id}>
                          {license.identifier} - USD{' '}
                          {license.basicUsd.toFixed(2)}
                        </option>
                      ))}
                    </FormSelect>
                    <FormSelect
                      {...getNameProp('licenseDetailId')}
                      label="License Detail"
                    >
                      <option value="">NONE</option>
                      {licenseDetails.map((licenseDetail) => (
                        <option key={licenseDetail.id} value={licenseDetail.id}>
                          {licenseDetail.identifier}
                        </option>
                      ))}
                    </FormSelect>
                    <FormTextField
                      {...getNameProp('addedPercentage')}
                      label="Added %"
                      type="number"
                    />
                  </div>
                </Card>
                <Card>
                  <CardHeader>Contract Details</CardHeader>
                  <div className="flex flex-col items-stretch gap-2 p-2">
                    <FormTextField
                      {...getNameProp('contractNumber')}
                      label="Contract #"
                    />
                    <FormTextField
                      {...getNameProp('dateOfContract')}
                      label="Date of Contract"
                      type="date"
                    />
                  </div>
                </Card>
                <Card>
                  <CardHeader>Accountant Details</CardHeader>
                  <div className="flex flex-col items-stretch gap-2 p-2">
                    <FormTextField
                      {...getNameProp('accountantName')}
                      label="Accountant Name"
                    />
                    <FormTextField
                      {...getNameProp('accountantEmail')}
                      label="Accountant Email"
                    />
                  </div>
                </Card>
              </div>
              <div className="flex flex-col items-stretch">
                <Card>
                  <CardHeader>Misc Details</CardHeader>
                  <div className="flex flex-col items-stretch gap-2 p-2">
                    <FormSelect {...getNameProp('groupId')} label="Group">
                      <option value="">NONE</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.identifier}
                        </option>
                      ))}
                    </FormSelect>
                    <FormSelect {...getNameProp('areaId')} label="Area">
                      <option value="">NONE</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.identifier}
                        </option>
                      ))}
                    </FormSelect>
                    <FormSelect {...getNameProp('sectorId')} label="Sector">
                      <option value="">NONE</option>
                      {sectors.map((sector) => (
                        <option key={sector.id} value={sector.id}>
                          {sector.identifier}
                        </option>
                      ))}
                    </FormSelect>
                    <FormTextField
                      {...getNameProp('vatNumber')}
                      label="VAT #"
                    />
                    <FormTextField
                      {...getNameProp('otherNames')}
                      label="Other Names On Cheques"
                    />
                    <FormTextArea
                      {...getNameProp('description')}
                      label="Description"
                    />
                    <FormTextField {...getNameProp('actual')} label="Actual" />
                    <FormTextField {...getNameProp('reason')} label="Reason" />
                    <FormSelect {...getNameProp('statusId')} label="Status">
                      <option value="">NONE</option>
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.identifier}
                        </option>
                      ))}
                    </FormSelect>
                    <FormTextArea {...getNameProp('comment')} label="Comment" />
                  </div>
                </Card>
              </div>
              <div className="flex flex-col items-stretch gap-6">
                <Card>
                  <CardHeader>Box Details</CardHeader>
                  <div className="flex flex-col items-stretch gap-2 p-2">
                    <FormSelect {...getNameProp('boxCityId')} label="City">
                      <option value="">NONE</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.identifier}
                        </option>
                      ))}
                    </FormSelect>
                    <FormTextField
                      {...getNameProp('boxNumber')}
                      label="Box Number"
                    />
                    <FormTextField
                      {...getNameProp('boxArea')}
                      label="Box Area"
                    />
                  </div>
                </Card>
                <Card>
                  <CardHeader>Delivery Address Details</CardHeader>
                  <div className="flex flex-col items-stretch gap-2 p-2">
                    <FormSelect
                      {...getNameProp('deliveryCityId')}
                      label="Delivery City"
                    >
                      <option value="">NONE</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.identifier}
                        </option>
                      ))}
                    </FormSelect>
                    <FormTextField
                      {...getNameProp('deliverySuburb')}
                      label="Delivery Suburb"
                    />
                    <FormTextField
                      {...getNameProp('deliveryAddress')}
                      label="Delivery Address"
                    />
                  </div>
                </Card>
                <Card>
                  <CardHeader>Databases</CardHeader>
                  <AddEditDatabases {...getNameProp('databases')} />
                </Card>
                <Card>
                  <CardHeader>Operators</CardHeader>
                  <AddEditOperators {...getNameProp('operators')} />
                </Card>
              </div>
            </div>
            <div className="flex flex-row items-start gap-4">
              {hasFormError(actionData) && (
                <InlineAlert>{actionData.formError}</InlineAlert>
              )}
              {!!fieldErrors && (
                <InlineAlert>{fieldErrorsToArr(fieldErrors)}</InlineAlert>
              )}
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <PrimaryButton type="submit" disabled={isProcessing}>
                {isProcessing ? 'Updating Customer Details...' : 'Submit'}
              </PrimaryButton>
            </div>
          </CenteredView>
        </ActionContextProvider>
      </Form>
      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}

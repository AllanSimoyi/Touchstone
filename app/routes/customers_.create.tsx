import type { ActionArgs, LoaderArgs } from '@remix-run/node';

import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';
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
  badRequest,
  processBadRequest,
} from '~/models/core.validations';
import { calcGross, calcNet, calcVat } from '~/models/customers';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import { getErrorMessage } from '~/models/errors';
import { getRawFormFields, hasFormError } from '~/models/forms';
import { AppLinks } from '~/models/links';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  const records = await Promise.all([
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
    prisma.license
      .findMany({
        select: { id: true, identifier: true, basicUsd: true },
      })
      .then((licenses) =>
        licenses.map((license) => ({
          ...license,
          basicUsd: license.basicUsd.toNumber(),
        }))
      ),
    prisma.licenseDetail.findMany({
      select: { id: true, identifier: true },
    }),
  ]);
  const [cities, statuses, groups, areas, sectors, licenses, licenseDetails] =
    records;

  return json({
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
  dateOfContract: z.coerce
    .date()
    .or(z.literal('').transform((arg) => undefined)),
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
      return processBadRequest(result.error, fields);
    }
    const { accountNumber, contractNumber, companyName, tradingAs, formerly } =
      result.data;
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
        where: { accountNumber },
      }),
      contractNumber
        ? prisma.account.count({ where: { contractNumber } })
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
      basicUsd: license.basicUsd.toNumber(),
      addedPercentage,
      numDatabases: databases.length,
    });

    const creationResult = await prisma.account
      .create({
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
          databases: {
            create: databases.map((databaseName) => ({
              databaseName,
            })),
          },
          operators: {
            create: operators.map((operator) => ({
              operatorName: operator.name,
              operatorEmail: operator.email,
            })),
          },
        },
      })
      .catch((error) => {
        return {
          formError:
            getErrorMessage(error) ||
            'Something went wrong recording the account',
        };
      });
    if (hasFormError(creationResult)) {
      return badRequest({ formError: creationResult.formError });
    }

    return redirect(AppLinks.Customer(creationResult.id));
  } catch (error) {
    const formError =
      getErrorMessage(error) ||
      'Something went wrong recording customer, please try again';
    return badRequest({ formError });
  }
};

export default function CreateCustomerPage() {
  const user = useUser();
  const { cities, statuses, groups, areas, sectors, licenses, licenseDetails } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { getNameProp, isProcessing } = useForm(actionData, Schema);

  const defaultValues = {
    companyName: 'Allan',
    accountNumber: '1234567',
    tradingAs: 'Allan',
    formerly: 'Allan',
    ceoName: 'Allan Simoyi',
    ceoEmail: 'bach@gmail.com',
    ceoPhone: '+263779528194',
    ceoFax: '12345',
    addr: '123 Place, Bigger Place',
    tel: '+263779528194',
    fax: '12345',
    cell: '+263779528194',
    licenseId: licenses[0].id.toString(),
    licenseDetailId: licenseDetails[0].id.toString(),
    addedPercentage: '15',
    contractNumber: '12345',
    dateOfContract: dayjs().format(DATE_INPUT_FORMAT),
    accountantName: 'Tatenda',
    accountantEmail: 'tatenda@gmail.com',
    groupId: groups[0].id.toString(),
    areaId: areas[0].id.toString(),
    sectorId: sectors[0].id.toString(),
    vatNumber: '12345',
    otherNames: 'Bach',
    description: 'Description goes here...',
    actual: '1',
    reason: 'Reason goes here...',
    statusId: statuses[0].id.toString(),
    comment: 'Comment goes here...',
    boxCityId: cities[0].id.toString(),
    boxNumber: '12345',
    boxArea: 'Area23',
    deliveryCityId: cities[0].id.toString(),
    deliverySuburb: 'Plce',
    deliveryAddress: '123 Another Place, Bigger Place',
    databases: '["Database one", "Database two"]',
    operators:
      '[{"name": "Allan", "email": "allan@gmail.com"}, {"name": "Tatenda", "email": "tatenda@gmail.com"}]',
  };

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      {hasFormError(actionData) && (
        <div className="fixed bottom-0 left-0 flex flex-col items-center justify-center p-2">
          <InlineAlert>{actionData.formError}</InlineAlert>
        </div>
      )}
      <Form method="post" className="flex grow flex-col items-stretch py-6">
        <ActionContextProvider
          {...actionData}
          fields={defaultValues}
          isSubmitting={isProcessing}
        >
          <CenteredView className="w-full gap-4 px-2">
            <div className="flex flex-col items-start justify-center pt-2">
              <span className="text-base font-semibold">
                Record New Customer
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
            <div className="flex flex-col items-center justify-center py-6">
              <PrimaryButton type="submit" disabled={isProcessing}>
                {isProcessing ? 'Recording New Customer...' : 'Submit'}
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

import type { ActionArgs, LoaderArgs } from '@remix-run/node';

import { Response, json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
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
  ComposeRecordIdSchema,
  RecordIdSchema,
  StatusCode,
  badRequest,
  getValidatedId,
  hasSuccess,
  processBadRequest,
} from '~/models/core.validations';
import { calcGross, calcNet, calcVat } from '~/models/customers';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import { getErrorMessage } from '~/models/errors';
import {
  EventKind,
  getOnlyChangedUpdateDetails,
  type UpdateEventDetails,
} from '~/models/events';
import {
  fieldErrorsToArr,
  getFieldErrors,
  getRawFormFields,
  hasFields,
  hasFormError,
} from '~/models/forms';
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
    prisma.license
      .findMany({
        select: { id: true, identifier: true, basicUsd: true },
      })
      .then((licenses) =>
        licenses.map((license) => ({
          ...license,
          basicUsd: license.basicUsd.toNumber().toFixed(2),
        }))
      ),
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
  licenseId: ComposeRecordIdSchema('license', 'optional'),
  licenseDetailId: ComposeRecordIdSchema('license detail record', 'optional'),
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
  groupId: ComposeRecordIdSchema('group', 'optional'),
  areaId: ComposeRecordIdSchema('area', 'optional'),
  sectorId: ComposeRecordIdSchema('sector', 'optional'),
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
  statusId: ComposeRecordIdSchema('status', 'optional'),
  comment: z
    .string()
    .max(1600, 'Use less than 1600 characters for the comment'),
  boxCityId: ComposeRecordIdSchema('box city', 'optional'),
  boxNumber: z
    .string()
    .max(200, 'Use less than 200 characters for the box number'),
  boxArea: z.string().max(200, 'Use less than 200 characters for the box area'),
  deliveryCityId: ComposeRecordIdSchema('delivery city', 'optional'),
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
  const currentUserId = await requireUserId(request);

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
      basicUsd: license.basicUsd.toNumber(),
      addedPercentage,
      numDatabases: databases.length,
    });

    await prisma.$transaction(async (tx) => {
      const accountBeforeUpdate = await tx.account.findUnique({
        where: { id },
        include: {
          group: true,
          area: true,
          sector: true,
          license: true,
          licenseDetail: true,
          boxCity: true,
          status: true,
          deliveryCity: true,
          databases: true,
          operators: true,
        },
      });
      if (!accountBeforeUpdate) {
        throw new Error('Account record not found');
      }
      const [updatedAccount] = await Promise.all([
        tx.account.update({
          where: { id },
          include: {
            group: true,
            area: true,
            sector: true,
            license: true,
            licenseDetail: true,
            boxCity: true,
            status: true,
            deliveryCity: true,
            databases: true,
            operators: true,
          },
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
        tx.database.deleteMany({
          where: { accountId: id },
        }),
        tx.database.createMany({
          data: databases.map((databaseName) => ({
            accountId: id,
            databaseName,
          })),
        }),
        tx.operator.deleteMany({
          where: { accountId: id },
        }),
        tx.operator.createMany({
          data: operators.map(({ name, email }) => ({
            accountId: id,
            operatorName: name,
            operatorEmail: email,
          })),
        }),
      ]);
      const details: UpdateEventDetails = {
        accountNumber: {
          from: accountBeforeUpdate.accountNumber,
          to: updatedAccount.accountNumber,
        },
        companyName: {
          from: accountBeforeUpdate.companyName,
          to: updatedAccount.companyName,
        },
        tradingAs: {
          from: accountBeforeUpdate.tradingAs,
          to: updatedAccount.tradingAs,
        },
        formerly: {
          from: accountBeforeUpdate.formerly,
          to: updatedAccount.formerly,
        },
        group: {
          from: accountBeforeUpdate.group?.identifier || '-',
          to: updatedAccount.group?.identifier || '-',
        },
        area: {
          from: accountBeforeUpdate.area?.identifier || '-',
          to: updatedAccount.area?.identifier || '-',
        },
        sector: {
          from: accountBeforeUpdate.sector?.identifier || '-',
          to: updatedAccount.sector?.identifier || '-',
        },
        vatNumber: {
          from: accountBeforeUpdate.vatNumber,
          to: updatedAccount.vatNumber,
        },
        otherNames: {
          from: accountBeforeUpdate.otherNames,
          to: updatedAccount.otherNames,
        },
        description: {
          from: accountBeforeUpdate.description,
          to: updatedAccount.description,
        },
        actual: { from: accountBeforeUpdate.actual, to: updatedAccount.actual },
        reason: { from: accountBeforeUpdate.reason, to: updatedAccount.reason },
        status: {
          from: accountBeforeUpdate.status?.identifier || '-',
          to: updatedAccount.status?.identifier || '-',
        },
        contractNumber: {
          from: accountBeforeUpdate.contractNumber,
          to: updatedAccount.contractNumber,
        },
        dateOfContract: {
          from: dayjs(accountBeforeUpdate.dateOfContract).format(
            DATE_INPUT_FORMAT
          ),
          to: dayjs(updatedAccount.dateOfContract).format(DATE_INPUT_FORMAT),
        },
        license: {
          from: accountBeforeUpdate.licenseId?.toString() || '-',
          to: updatedAccount.licenseId?.toString() || '-',
        },
        licenseDetail: {
          from: accountBeforeUpdate.licenseDetailId?.toString() || '-',
          to: updatedAccount.licenseDetailId?.toString() || '-',
        },
        addedPercentage: {
          from: accountBeforeUpdate.addedPercentage,
          to: updatedAccount.addedPercentage,
        },
        gross: {
          from: accountBeforeUpdate.gross.toString(),
          to: updatedAccount.gross.toString(),
        },
        net: {
          from: accountBeforeUpdate.net.toString(),
          to: updatedAccount.net.toString(),
        },
        vat: {
          from: accountBeforeUpdate.vat.toString(),
          to: updatedAccount.vat.toString(),
        },
        comment: {
          from: accountBeforeUpdate.comment,
          to: updatedAccount.comment,
        },
        accountantName: {
          from: accountBeforeUpdate.accountantName,
          to: updatedAccount.accountantName,
        },
        accountantEmail: {
          from: accountBeforeUpdate.accountantEmail,
          to: updatedAccount.accountantEmail,
        },
        boxCity: {
          from: accountBeforeUpdate.boxCityId?.toString() || '-',
          to: updatedAccount.boxCityId?.toString() || '-',
        },
        boxNumber: {
          from: accountBeforeUpdate.boxNumber,
          to: updatedAccount.boxNumber,
        },
        boxArea: {
          from: accountBeforeUpdate.boxArea,
          to: updatedAccount.boxArea,
        },
        ceoName: {
          from: accountBeforeUpdate.ceoName,
          to: updatedAccount.ceoName,
        },
        ceoEmail: {
          from: accountBeforeUpdate.ceoEmail,
          to: updatedAccount.ceoEmail,
        },
        ceoPhone: {
          from: accountBeforeUpdate.ceoPhone,
          to: updatedAccount.ceoPhone,
        },
        ceoFax: {
          from: accountBeforeUpdate.ceoFax,
          to: updatedAccount.ceoFax,
        },
        physicalAddress: {
          from: accountBeforeUpdate.physicalAddress,
          to: updatedAccount.physicalAddress,
        },
        telephoneNumber: {
          from: accountBeforeUpdate.telephoneNumber,
          to: updatedAccount.telephoneNumber,
        },
        faxNumber: {
          from: accountBeforeUpdate.faxNumber,
          to: updatedAccount.faxNumber,
        },
        cellphoneNumber: {
          from: accountBeforeUpdate.cellphoneNumber,
          to: updatedAccount.cellphoneNumber,
        },
        deliveryAddress: {
          from: accountBeforeUpdate.deliveryAddress,
          to: updatedAccount.deliveryAddress,
        },
        deliverySuburb: {
          from: accountBeforeUpdate.deliverySuburb,
          to: updatedAccount.deliverySuburb,
        },
        deliveryCity: {
          from: accountBeforeUpdate.deliveryCity?.identifier || '-',
          to: updatedAccount.deliveryCity?.identifier || '-',
        },
        databases: {
          from:
            accountBeforeUpdate.databases
              .map((d) => d.databaseName)
              .join(', ') || '-',
          to:
            updatedAccount.databases.map((d) => d.databaseName).join(', ') ||
            '-',
        },
        operators: {
          from:
            accountBeforeUpdate.operators
              .map((o) => o.operatorName + '-' + o.operatorEmail)
              .join(', ') || '-',
          to:
            updatedAccount.operators
              .map((o) => o.operatorName + '-' + o.operatorEmail)
              .join(', ') || '-',
        },
        createdAt: {
          from: dayjs(accountBeforeUpdate.createdAt).format(DATE_INPUT_FORMAT),
          to: dayjs(updatedAccount.createdAt).format(DATE_INPUT_FORMAT),
        },
        updatedAt: {
          from: dayjs(accountBeforeUpdate.updatedAt).format(DATE_INPUT_FORMAT),
          to: dayjs(updatedAccount.updatedAt).format(DATE_INPUT_FORMAT),
        },
      };
      await tx.accountEvent.create({
        data: {
          accountId: updatedAccount.id,
          userId: currentUserId,
          details: JSON.stringify(getOnlyChangedUpdateDetails(details)),
          kind: EventKind.Update,
        },
      });
      return updatedAccount;
    });

    return json({ success: true });
    // return redirect(`${AppLinks.Customer(id)}?message=Customer_updated`);
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
  const fetcher = useFetcher<typeof action>();

  const { getNameProp, isProcessing } = useForm(fetcher.data, Schema);

  useEffect(() => {
    if (hasSuccess(fetcher.data)) {
      toast.success('Customer record updated successfully!', {
        duration: 5_000,
      });
    }
  }, [fetcher.data]);

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
    licenseId: account.licenseId?.toString() || '',
    licenseDetailId: account.licenseDetailId?.toString() || '',
    addedPercentage: account.addedPercentage.toFixed(),
    contractNumber: account.contractNumber,
    dateOfContract: dayjs(account.dateOfContract).format(DATE_INPUT_FORMAT),
    accountantName: account.accountantName || '',
    accountantEmail: account.accountantEmail || '',
    groupId: account.groupId?.toString() || '',
    areaId: account.areaId?.toString() || '',
    sectorId: account.sectorId?.toString() || '',
    vatNumber: account.vatNumber,
    otherNames: account.otherNames,
    description: account.description,
    actual: account.actual?.toString() || '',
    reason: account.reason,
    statusId: account.statusId?.toString() || '',
    comment: account.comment,
    boxCityId: account.boxCityId?.toString() || '',
    boxNumber: account.boxNumber || '-',
    boxArea: account.boxArea || '-',
    deliveryCityId: account.deliveryCityId?.toString() || '',
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

  const fieldErrors = useMemo(
    () => getFieldErrors(fetcher.data),
    [fetcher.data]
  );

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <fetcher.Form
        method="post"
        className="flex grow flex-col items-stretch py-6"
      >
        <ActionContextProvider
          {...fetcher.data}
          fields={hasFields(fetcher.data) ? fetcher.data.fields : defaultValues}
          isSubmitting={isProcessing}
        >
          <CenteredView className="w-full gap-4 px-2">
            <input type="hidden" name="id" value={account.id} />
            <div className="flex flex-col items-start justify-center pt-2">
              <span className="text-lg font-semibold">
                Update Customer Details
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>Identification Details</CardHeader>
                <div className="grid grow grid-cols-3 gap-2 p-2 font-light">
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Company</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('companyName')} />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Account #</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('accountNumber')} />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Trading As</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('tradingAs')} />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Formerly</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('formerly')} />
                  </div>
                </div>
              </Card>
              <Card>
                <CardHeader>CEO Details</CardHeader>
                <div className="grid grow grid-cols-3 gap-2 p-2 font-light">
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>CEO's Name</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('ceoName')} />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>CEO's Email</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('ceoEmail')} />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>CEO's Phone</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('ceoPhone')} />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>CEO's Fax</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('ceoFax')} />
                  </div>
                </div>
              </Card>
              <Card>
                <CardHeader>Contact Details</CardHeader>
                <div className="grid grow grid-cols-3 gap-2 p-2 font-light">
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Address</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('addr')} />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Telephone</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('tel')} />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Fax #</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('fax')} />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Cellphone</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('cell')} />
                  </div>
                </div>
              </Card>
              <div className="flex flex-col items-stretch gap-6">
                <Card>
                  <CardHeader>License Details</CardHeader>
                  <div className="grid grow grid-cols-3 gap-2 p-2 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>License</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect {...getNameProp('licenseId')}>
                        <option value="">NONE</option>
                        {licenses.map((license) => (
                          <option key={license.id} value={license.id}>
                            {license.identifier} - USD {license.basicUsd}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>License Detail</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect {...getNameProp('licenseDetailId')}>
                        <option value="">NONE</option>
                        {licenseDetails.map((licenseDetail) => (
                          <option
                            key={licenseDetail.id}
                            value={licenseDetail.id}
                          >
                            {licenseDetail.identifier}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Added %</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...getNameProp('addedPercentage')}
                        type="number"
                      />
                    </div>
                  </div>
                </Card>
                <Card className="grow">
                  <CardHeader>Contract Details</CardHeader>
                  <div className="grid grid-cols-3 gap-6 p-2 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Contract #</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField {...getNameProp('contractNumber')} />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Date of Contract</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...getNameProp('dateOfContract')}
                        type="date"
                      />
                    </div>
                  </div>
                </Card>
                <Card className="grow">
                  <CardHeader>Accountant Details</CardHeader>
                  <div className="grid grid-cols-3 gap-6 p-2 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Accountant Name</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField {...getNameProp('accountantName')} />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Accountant Email</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField {...getNameProp('accountantEmail')} />
                    </div>
                  </div>
                </Card>
              </div>
              <div className="flex flex-col items-stretch">
                <Card className="grow">
                  <CardHeader>Misc Details</CardHeader>
                  <div className="grid grow grid-cols-3 gap-2 p-2 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Group</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect {...getNameProp('groupId')}>
                        <option value="">NONE</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.identifier}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Area</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect {...getNameProp('areaId')}>
                        <option value="">NONE</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.identifier}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Sector</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect {...getNameProp('sectorId')}>
                        <option value="">NONE</option>
                        {sectors.map((sector) => (
                          <option key={sector.id} value={sector.id}>
                            {sector.identifier}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>VAT #</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField {...getNameProp('vatNumber')} />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Other Names On Cheques</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField {...getNameProp('otherNames')} />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Description</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextArea {...getNameProp('description')} />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Actual</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField {...getNameProp('actual')} />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Reason</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField {...getNameProp('reason')} />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Status</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect {...getNameProp('statusId')}>
                        <option value="">NONE</option>
                        {statuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.identifier}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Comment</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextArea {...getNameProp('comment')} />
                    </div>
                  </div>
                </Card>
              </div>
              <div className="flex flex-col items-stretch gap-6">
                <Card>
                  <CardHeader>Box Details</CardHeader>
                  <div className="grid grow grid-cols-3 gap-2 p-2 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>City</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect {...getNameProp('boxCityId')}>
                        <option value="">NONE</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.identifier}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Box Number</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField {...getNameProp('boxNumber')} />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Box Area</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField {...getNameProp('boxArea')} />
                    </div>
                  </div>
                </Card>
                <Card>
                  <CardHeader>Delivery Address Details</CardHeader>
                  <div className="grid grid-cols-3 gap-2 p-2 font-light">
                    <div className="flex flex-col items-stretch justify-center p-2">
                      <span>Delivery City</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect {...getNameProp('deliveryCityId')}>
                        <option value="">NONE</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.identifier}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Delivery Suburb</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField {...getNameProp('deliverySuburb')} />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Delivery Address</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField {...getNameProp('deliveryAddress')} />
                    </div>
                  </div>
                </Card>
                <Card className="grow">
                  <CardHeader>Databases</CardHeader>
                  <AddEditDatabases {...getNameProp('databases')} />
                </Card>
                <Card className="grow">
                  <CardHeader>Operators</CardHeader>
                  <AddEditOperators {...getNameProp('operators')} />
                </Card>
              </div>
            </div>
            <div className="flex flex-row items-start gap-4">
              {hasFormError(fetcher.data) && (
                <InlineAlert>{fetcher.data.formError}</InlineAlert>
              )}
              {!!fieldErrors && (
                <InlineAlert>{fieldErrorsToArr(fieldErrors)}</InlineAlert>
              )}
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="flex min-w-[20%] flex-col items-stretch">
                <PrimaryButton type="submit" disabled={isProcessing}>
                  {isProcessing ? 'Updating Customer Details...' : 'Submit'}
                </PrimaryButton>
              </div>
            </div>
          </CenteredView>
        </ActionContextProvider>
      </fetcher.Form>
      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}

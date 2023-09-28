import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { RefObject } from 'react';
import type { CreateOrDeleteEventDetails } from '~/models/events';

import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';
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
  badRequest,
  hasSuccess,
  processBadRequest,
} from '~/models/core.validations';
import { calcGross, calcNet, calcVat } from '~/models/customers';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import { getErrorMessage } from '~/models/errors';
import { EventKind } from '~/models/events';
import { getRawFormFields, hasFormError } from '~/models/forms';
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
  licenseId: ComposeRecordIdSchema('license', 'optional'),
  licenseDetailId: ComposeRecordIdSchema('license detail record', 'optional'),
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

    const creationResult = await prisma.$transaction(async (tx) => {
      const newAccount = await tx.account.create({
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
      });
      const details: CreateOrDeleteEventDetails = {
        accountNumber: newAccount.accountNumber,
        companyName: newAccount.companyName,
        tradingAs: newAccount.tradingAs,
        formerly: newAccount.formerly,
        group: newAccount.group?.identifier || '-',
        area: newAccount.area?.identifier || '-',
        sector: newAccount.sector?.identifier || '-',
        vatNumber: newAccount.vatNumber,
        otherNames: newAccount.otherNames,
        description: newAccount.description,
        actual: newAccount.actual,
        reason: newAccount.reason,
        status: newAccount.status?.identifier || '-',
        contractNumber: newAccount.contractNumber,
        dateOfContract: dayjs(newAccount.dateOfContract).format(
          DATE_INPUT_FORMAT
        ),
        license: newAccount.licenseId?.toString() || '-',
        licenseDetail: newAccount.licenseDetailId?.toString() || '-',
        addedPercentage: newAccount.addedPercentage,
        gross: newAccount.gross.toString(),
        net: newAccount.net.toString(),
        vat: newAccount.vat.toString(),
        comment: newAccount.comment,
        accountantName: newAccount.accountantName,
        accountantEmail: newAccount.accountantEmail,
        boxCity: newAccount.boxCityId?.toString() || '-',
        boxNumber: newAccount.boxNumber,
        boxArea: newAccount.boxArea,
        ceoName: newAccount.ceoName,
        ceoEmail: newAccount.ceoEmail,
        ceoPhone: newAccount.ceoPhone,
        ceoFax: newAccount.ceoFax,
        physicalAddress: newAccount.physicalAddress,
        telephoneNumber: newAccount.telephoneNumber,
        faxNumber: newAccount.faxNumber,
        cellphoneNumber: newAccount.cellphoneNumber,
        deliveryAddress: newAccount.deliveryAddress,
        deliverySuburb: newAccount.deliverySuburb,
        deliveryCity: newAccount.deliveryCity?.identifier || '-',
        databases:
          newAccount.databases.map((d) => d.databaseName).join(', ') || '-',
        operators:
          newAccount.operators
            .map((o) => o.operatorName + '-' + o.operatorEmail)
            .join(', ') || '-',
        createdAt: dayjs(newAccount.createdAt).format(DATE_INPUT_FORMAT),
        updatedAt: dayjs(newAccount.updatedAt).format(DATE_INPUT_FORMAT),
      };
      await tx.accountEvent.create({
        data: {
          accountId: newAccount.id,
          userId: currentUserId,
          details: JSON.stringify(details),
          kind: EventKind.Create,
        },
      });
      return newAccount;
    });
    if (hasFormError(creationResult)) {
      return badRequest({ formError: creationResult.formError });
    }

    return json({ success: true });
    // return redirect(
    //   `${AppLinks.Customer(creationResult.id)}?message=Customer_added`
    // );
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
  const fetcher = useFetcher<typeof action>();

  const { getNameProp, isProcessing } = useForm(fetcher.data, Schema);

  const companyNameRef = useRef<HTMLInputElement>(null);
  const accountNumberRef = useRef<HTMLInputElement>(null);
  const tradingAsRef = useRef<HTMLInputElement>(null);
  const formerlyRef = useRef<HTMLInputElement>(null);
  const ceoNameRef = useRef<HTMLInputElement>(null);
  const ceoEmailRef = useRef<HTMLInputElement>(null);
  const ceoPhoneRef = useRef<HTMLInputElement>(null);
  const ceoFaxRef = useRef<HTMLInputElement>(null);
  const addrRef = useRef<HTMLInputElement>(null);
  const telRef = useRef<HTMLInputElement>(null);
  const faxRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLInputElement>(null);
  const licenseIdRef = useRef<HTMLSelectElement>(null);
  const licenseDetailIdRef = useRef<HTMLSelectElement>(null);
  const addedPercentageRef = useRef<HTMLInputElement>(null);
  const contractNumberRef = useRef<HTMLInputElement>(null);
  const dateOfContractRef = useRef<HTMLInputElement>(null);
  const accountantNameRef = useRef<HTMLInputElement>(null);
  const accountantEmailRef = useRef<HTMLInputElement>(null);
  const groupIdRef = useRef<HTMLSelectElement>(null);
  const areaIdRef = useRef<HTMLSelectElement>(null);
  const sectorIdRef = useRef<HTMLSelectElement>(null);
  const vatNumberRef = useRef<HTMLInputElement>(null);
  const otherNamesRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const actualRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLInputElement>(null);
  const statusIdRef = useRef<HTMLSelectElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const boxCityIdRef = useRef<HTMLSelectElement>(null);
  const boxNumberRef = useRef<HTMLInputElement>(null);
  const boxAreaRef = useRef<HTMLInputElement>(null);
  const deliveryCityIdRef = useRef<HTMLSelectElement>(null);
  const deliverySuburbRef = useRef<HTMLInputElement>(null);
  const deliveryAddressRef = useRef<HTMLInputElement>(null);

  const clearRef = (
    ref: RefObject<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (ref.current) {
      ref.current.value = '';
    }
  };

  useEffect(() => {
    if (hasSuccess(fetcher.data)) {
      toast.success('Customer record created successfully!', {
        duration: 5_000,
      });
      clearRef(companyNameRef);
      clearRef(accountNumberRef);
      clearRef(tradingAsRef);
      clearRef(formerlyRef);
      clearRef(ceoNameRef);
      clearRef(ceoEmailRef);
      clearRef(ceoPhoneRef);
      clearRef(ceoFaxRef);
      clearRef(addrRef);
      clearRef(telRef);
      clearRef(faxRef);
      clearRef(cellRef);
      clearRef(licenseIdRef);
      clearRef(licenseDetailIdRef);
      clearRef(addedPercentageRef);
      clearRef(contractNumberRef);
      clearRef(dateOfContractRef);
      clearRef(accountantNameRef);
      clearRef(accountantEmailRef);
      clearRef(groupIdRef);
      clearRef(areaIdRef);
      clearRef(sectorIdRef);
      clearRef(vatNumberRef);
      clearRef(otherNamesRef);
      clearRef(descriptionRef);
      clearRef(actualRef);
      clearRef(reasonRef);
      clearRef(statusIdRef);
      clearRef(commentRef);
      clearRef(boxCityIdRef);
      clearRef(boxNumberRef);
      clearRef(boxAreaRef);
      clearRef(deliveryCityIdRef);
      clearRef(deliverySuburbRef);
      clearRef(deliveryAddressRef);
    }
  }, [fetcher.data]);

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
      {hasFormError(fetcher.data) && (
        <div
          role="status"
          className="fixed bottom-0 left-0 flex flex-col items-center justify-center p-2"
        >
          <InlineAlert>{fetcher.data.formError}</InlineAlert>
        </div>
      )}
      <fetcher.Form
        method="post"
        className="flex grow flex-col items-stretch py-6"
      >
        <ActionContextProvider
          {...fetcher.data}
          fields={defaultValues}
          isSubmitting={isProcessing}
        >
          <CenteredView className="w-full gap-4 px-2">
            <div className="flex flex-col items-start justify-center pt-2">
              <span className="text-lg font-semibold">Record New Customer</span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>Identification Details</CardHeader>
                <div className="grid grow grid-cols-3 gap-2 p-2 font-light">
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Company</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField
                      {...getNameProp('companyName')}
                      customRef={companyNameRef}
                    />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Account #</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField
                      {...getNameProp('accountNumber')}
                      customRef={accountNumberRef}
                    />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Trading As</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField
                      {...getNameProp('tradingAs')}
                      customRef={tradingAsRef}
                    />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Formerly</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField
                      {...getNameProp('formerly')}
                      customRef={formerlyRef}
                    />
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
                    <FormTextField
                      {...getNameProp('ceoName')}
                      customRef={ceoNameRef}
                    />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>CEO's Email</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField
                      {...getNameProp('ceoEmail')}
                      customRef={ceoEmailRef}
                    />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>CEO's Phone</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField
                      {...getNameProp('ceoPhone')}
                      customRef={ceoPhoneRef}
                    />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>CEO's Fax #</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField
                      {...getNameProp('ceoFax')}
                      customRef={ceoFaxRef}
                    />
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
                    <FormTextField
                      {...getNameProp('addr')}
                      customRef={addrRef}
                    />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Telephone</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('tel')} customRef={telRef} />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Fax Number</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField {...getNameProp('fax')} customRef={faxRef} />
                  </div>
                  <div className="flex flex-col items-start justify-center p-2">
                    <span>Cellphone</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-stretch justify-center">
                    <FormTextField
                      {...getNameProp('cell')}
                      customRef={cellRef}
                    />
                  </div>
                </div>
              </Card>
              <div className="flex flex-col items-stretch gap-6">
                <Card>
                  <CardHeader>License Details</CardHeader>
                  <div className="grid grid-cols-3 gap-2 p-2 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>License</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect
                        {...getNameProp('licenseId')}
                        customRef={licenseIdRef}
                      >
                        <option value="">NONE</option>
                        {licenses.map((license) => (
                          <option key={license.id} value={license.id}>
                            {license.identifier} - USD{' '}
                            {license.basicUsd.toFixed(2)}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>License Detail</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect
                        {...getNameProp('licenseDetailId')}
                        customRef={licenseDetailIdRef}
                      >
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
                        customRef={addedPercentageRef}
                        type="number"
                      />
                    </div>
                  </div>
                </Card>
                <Card className="grow">
                  <CardHeader>Contract Details</CardHeader>
                  <div className="grid grid-cols-3 gap-6 px-2 py-6 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Contract #</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...getNameProp('contractNumber')}
                        customRef={contractNumberRef}
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Date of Contract</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...getNameProp('dateOfContract')}
                        customRef={dateOfContractRef}
                        type="date"
                      />
                    </div>
                  </div>
                </Card>
                <Card className="grow">
                  <CardHeader>Accountant Details</CardHeader>
                  <div className="grid grid-cols-3 gap-2 px-2 py-6 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Accountant Name</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...getNameProp('accountantName')}
                        customRef={accountantNameRef}
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Accountant Email</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...getNameProp('accountantEmail')}
                        customRef={accountantEmailRef}
                      />
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
                      <FormSelect
                        {...getNameProp('groupId')}
                        customRef={groupIdRef}
                      >
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
                      <FormSelect
                        {...getNameProp('areaId')}
                        customRef={areaIdRef}
                      >
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
                      <FormSelect
                        {...getNameProp('sectorId')}
                        customRef={sectorIdRef}
                      >
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
                      <FormTextField
                        {...getNameProp('vatNumber')}
                        customRef={vatNumberRef}
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Other Names On Cheques</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...getNameProp('otherNames')}
                        customRef={otherNamesRef}
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Description</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextArea
                        {...getNameProp('description')}
                        customRef={descriptionRef}
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Actual</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...getNameProp('actual')}
                        customRef={actualRef}
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Reason</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...getNameProp('reason')}
                        customRef={reasonRef}
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Status</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect
                        {...getNameProp('statusId')}
                        customRef={statusIdRef}
                      >
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
                      <FormTextArea
                        {...getNameProp('comment')}
                        customRef={commentRef}
                      />
                    </div>
                  </div>
                </Card>
              </div>
              <div className="flex flex-col items-stretch gap-6">
                <Card>
                  <CardHeader>Box Details</CardHeader>
                  <div className="grid grid-cols-3 gap-2 p-2 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>City</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect
                        {...getNameProp('boxCityId')}
                        customRef={boxCityIdRef}
                      >
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
                      <FormTextField
                        {...getNameProp('boxNumber')}
                        customRef={boxNumberRef}
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Box Area</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...getNameProp('boxArea')}
                        customRef={boxAreaRef}
                      />
                    </div>
                  </div>
                </Card>
                <Card>
                  <CardHeader>Delivery Address Details</CardHeader>
                  <div className="grid grid-cols-3 gap-2 p-2 font-light">
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Delivery City</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormSelect
                        {...getNameProp('deliveryCityId')}
                        customRef={deliveryCityIdRef}
                      >
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
                      <FormTextField
                        {...getNameProp('deliverySuburb')}
                        customRef={deliverySuburbRef}
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center p-2">
                      <span>Delivery Address</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-stretch justify-center">
                      <FormTextField
                        {...getNameProp('deliveryAddress')}
                        customRef={deliveryAddressRef}
                      />
                    </div>
                  </div>
                </Card>
                <Card className="grow">
                  <CardHeader>Databases</CardHeader>
                  <AddEditDatabases
                    {...getNameProp('databases')}
                    clearInput={hasSuccess(fetcher.data)}
                  />
                </Card>
                <Card className="grow">
                  <CardHeader>Operators</CardHeader>
                  <AddEditOperators
                    {...getNameProp('operators')}
                    clearInput={hasSuccess(fetcher.data)}
                  />
                </Card>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="flex min-w-[20%] flex-col items-stretch">
                <PrimaryButton type="submit" disabled={isProcessing}>
                  {isProcessing ? 'Recording New Customer...' : 'Submit'}
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

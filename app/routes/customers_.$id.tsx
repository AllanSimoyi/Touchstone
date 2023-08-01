import type { LoaderArgs } from '@remix-run/node';
import type { z } from 'zod';
import type { DeleteRecordSchema } from '~/models/core.validations';

import { Response, json } from '@remix-run/node';
import { Link, useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { ChevronRight } from 'tabler-icons-react';

import { AccountantDetails } from '~/components/AccountantDetails';
import { RouteErrorBoundary } from '~/components/Boundaries';
import { CenteredView } from '~/components/CenteredView';
import { CeoDetails } from '~/components/CeoDetails';
import { Chip } from '~/components/Chip';
import { ConfirmDelete } from '~/components/ConfirmDelete';
import { ContactDetails } from '~/components/ContactDetails';
import { ContractDetails } from '~/components/ContractDetails';
import { DangerButton } from '~/components/DangerButton';
import { DatabaseDetails } from '~/components/DatabaseDetails';
import { Footer } from '~/components/Footer';
import { LicenseDetails } from '~/components/LicenseDetails';
import { MiscDetails } from '~/components/MiscDetails';
import { MiscDetails2 } from '~/components/MiscDetails2';
import { MiscDetails3 } from '~/components/MiscDetails3';
import { OperatorDetails } from '~/components/OperatorDetails';
import { PrimaryButtonLink } from '~/components/PrimaryButton';
import { Toolbar } from '~/components/Toolbar';
import { UnderLineOnHover } from '~/components/UnderLineOnHover';
import { prisma } from '~/db.server';
import { useDelete } from '~/hooks/useDelete';
import {
  StatusCode,
  getValidatedId,
  hasSuccess,
} from '~/models/core.validations';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import { AppLinks } from '~/models/links';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUserId(request);

  const id = getValidatedId(params.id);
  const customer = await prisma.account
    .findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        accountNumber: true,
        tradingAs: true,
        formerly: true,
        group: { select: { identifier: true } },
        area: { select: { identifier: true } },
        sector: { select: { identifier: true } },
        vat: true,
        otherNames: true,
        actual: true,
        reason: true,
        status: true,
        boxNumber: true,
        boxArea: true,
        boxCity: { select: { identifier: true } },
        deliveryCity: { select: { identifier: true } },
        deliveryAddress: true,
        deliverySuburb: true,
        description: true,
        comment: true,
        contractNumber: true,
        dateOfContract: true,
        license: { select: { identifier: true, basicUsd: true } },
        licenseDetail: { select: { identifier: true } },
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
        databases: { select: { databaseName: true } },
        operators: { select: { operatorName: true, operatorEmail: true } },
      },
    })
    .then((customer) => {
      if (!customer) {
        return null;
      }
      const { dateOfContract, license, ...restOfCustomer } = customer;
      return {
        ...restOfCustomer,
        license: {
          ...license,
          basicUsd: license.basicUsd.toNumber().toFixed(2),
        },
        dateOfContract: dateOfContract
          ? dayjs(dateOfContract).format(DATE_INPUT_FORMAT)
          : undefined,
      };
    });
  if (!customer) {
    throw new Response('Account not found', { status: StatusCode.NotFound });
  }

  return json({ customer });
};

export default function CustomerPage() {
  const user = useUser();
  const { customer } = useLoaderData<typeof loader>();
  const { submit, ...fetcher } = useFetcher();
  const navigate = useNavigate();

  const { isOpen, askForConfirmation, closeModal, onConfirmed } = useDelete({
    handleDelete: () => {
      const data: z.infer<typeof DeleteRecordSchema> = {
        id: customer.id,
        recordType: 'Account',
      };
      return submit(data, { action: AppLinks.DeleteRecord, method: 'post' });
    },
  });

  useEffect(() => {
    if (hasSuccess(fetcher.data)) {
      navigate(AppLinks.Customers);
    }
  }, [fetcher.data, navigate]);

  const isDeleting = fetcher.state !== 'idle';

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <ConfirmDelete
          isOpen={isOpen}
          onConfirmed={onConfirmed}
          closeModal={closeModal}
        />
        <CenteredView className="gap-6 px-2">
          <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
            <div className="flex flex-col items-start gap-2">
              <h2 className="flex flex-row items-stretch gap-2 text-2xl font-semibold">
                <Link to={AppLinks.Customers}>
                  <UnderLineOnHover>
                    <span className="text-zinc-400 transition-all duration-150 hover:text-zinc-800">
                      Customers
                    </span>
                  </UnderLineOnHover>
                </Link>
                <div className="flex flex-col items-center justify-center">
                  <ChevronRight className="text-zinc-400" />
                </div>
                <span className="text-zinc-800">{customer.companyName}</span>
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Chip className="bg-zinc-200 py-1">
                  <span className="font-zinc-600 text-base font-light">
                    Account #{' '}
                    <span className="font-normal">
                      {customer.accountNumber}
                    </span>
                  </span>
                </Chip>
                {!!customer.tradingAs && (
                  <Chip className="bg-zinc-200 py-1">
                    <span className="font-zinc-600 text-base font-light">
                      Trading as{' '}
                      <span className="font-normal">{customer.tradingAs}</span>
                    </span>
                  </Chip>
                )}
                {!!customer.formerly && (
                  <Chip className="bg-zinc-200 py-1">
                    <span className="font-zinc-600 text-base font-light">
                      Formerly{' '}
                      <span className="font-normal">{customer.formerly}</span>
                    </span>
                  </Chip>
                )}
              </div>
            </div>
            <div className="grow" />
            <div className="flex flex-row items-center gap-2">
              {!isDeleting && (
                <PrimaryButtonLink to={AppLinks.EditCustomer(customer.id)}>
                  Edit Customer
                </PrimaryButtonLink>
              )}
              <DangerButton
                type="button"
                onClick={askForConfirmation}
                disabled={isDeleting}
              >
                Delete Customer
              </DangerButton>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ContactDetails
              addr={customer.physicalAddress}
              tel={customer.telephoneNumber}
              fax={customer.faxNumber}
              cell={customer.cellphoneNumber}
            />
            <CeoDetails
              name={customer.ceoName}
              email={customer.ceoEmail}
              phone={customer.ceoPhone}
              fax={customer.ceoFax}
            />
            <MiscDetails
              group={customer.group.identifier}
              area={customer.area.identifier}
              sector={customer.sector.identifier}
              vatNumber={customer.vatNumber}
            />
            <LicenseDetails
              license={customer.license}
              licenseDetail={customer.licenseDetail.identifier}
              addedPercentage={customer.addedPercentage}
              gross={Number(customer.gross)}
              net={Number(customer.net)}
              vat={Number(customer.vat)}
            />
            <div className="flex flex-col items-stretch gap-4">
              <ContractDetails
                contractNumber={customer.contractNumber}
                dateOfContract={customer.dateOfContract || ''}
              />
              <AccountantDetails
                name={customer.accountantName || ''}
                email={customer.accountantEmail || ''}
              />
            </div>
            <MiscDetails2
              otherNames={customer.otherNames}
              actual={customer.actual}
              reason={customer.reason}
              status={customer.status.identifier}
            />
            <DatabaseDetails
              databases={customer.databases.map(
                (database) => database.databaseName
              )}
            />
            <OperatorDetails
              operators={customer.operators.map((operator) => ({
                name: operator.operatorName,
                email: operator.operatorEmail,
              }))}
            />
            <MiscDetails3
              box={
                [
                  customer.boxNumber,
                  customer.boxArea,
                  customer.boxCity.identifier,
                ]
                  .filter(Boolean)
                  .join(', ') || ''
              }
              deliveryAddr={
                [
                  customer.deliveryAddress,
                  customer.deliverySuburb,
                  customer.deliveryCity.identifier,
                ]
                  .filter(Boolean)
                  .join(', ') || ''
              }
              description={customer.description}
              comment={customer.comment}
            />
          </div>
        </CenteredView>
      </div>
      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}

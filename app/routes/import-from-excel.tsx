import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { ChangeEvent } from 'react';
import type { ParsedExcelRow } from '~/models/excel';

import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useCallback, useEffect, useState } from 'react';
import readXlsxFile from 'read-excel-file';
import { toast } from 'sonner';
import { Check } from 'tabler-icons-react';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

import {
  ActionContextProvider,
  useForm,
} from '~/components/ActionContextProvider';
import { RouteErrorBoundary } from '~/components/Boundaries';
import { Card } from '~/components/Card';
import { CenteredView } from '~/components/CenteredView';
import { Footer } from '~/components/Footer';
import { InlineAlert } from '~/components/InlineAlert';
import { PrimaryButton } from '~/components/PrimaryButton';
import { Toolbar } from '~/components/Toolbar';
import { prisma } from '~/db.server';
import {
  hasSuccess,
  processBadRequest,
  stringifyZodError,
} from '~/models/core.validations';
import { calcGross, calcNet, calcVat } from '~/models/customers';
import { getErrorMessage } from '~/models/errors';
import { EXCEL_TABLE_COLUMNS, ExcelRowSchema } from '~/models/excel';
import { getRawFormFields } from '~/models/forms';
import { logParseError } from '~/models/logger.server';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  return json(null);
};

const Schema = z.object({
  rows: z.preprocess((arg) => {
    if (typeof arg === 'string') {
      return JSON.parse(arg);
    }
  }, ExcelRowSchema.array()),
});

export async function action({ request }: ActionArgs) {
  await requireUserId(request);

  const fields = await getRawFormFields(request);
  const result = Schema.safeParse(fields);
  if (!result.success) {
    logParseError(request, result.error, fields);
    return processBadRequest(result.error, fields);
  }
  const { rows } = result.data;

  for (let row of rows) {
    const [
      accountNumber,
      companyName,
      tradingAs,
      formerly,
      group,
      area,
      sector,
      vatNumber,
      otherNames,
      description,
      actual,
      reason,
      status,
      contractNumber,
      dateOfContract,
      license,
      basicUsd,
      licenseDetail,
      addedPercentage,
      comment,
      ceoName,
      ceoEmail,
      ceoPhone,
      ceoFax,
      addr,
      tel,
      fax,
      cell,
      accountantName,
      accountantEmail,
      boxCity,
      boxNumber,
      boxArea,
      deliveryCity,
      deliveryAddress,
      deliverySuburb,
      databases,
      operatorName,
      operatorEmail,
    ] = row;

    const [accNumDuplicates, contractNumDuplicates] = await Promise.all([
      prisma.account.count({
        where: { accountNumber },
      }),
      contractNumber
        ? prisma.account.count({ where: { contractNumber } })
        : undefined,
    ]);
    if (accNumDuplicates || contractNumDuplicates) {
      continue;
    }

    const gross = calcGross({
      basicUsd,
      addedPercentage,
      numDatabases: databases.length,
    });

    await prisma.account.create({
      select: { id: true },
      data: {
        accountNumber,
        companyName,
        tradingAs,
        formerly,
        group: {
          connectOrCreate: {
            where: { identifier: group },
            create: { identifier: group },
          },
        },
        area: {
          connectOrCreate: {
            where: { identifier: area },
            create: { identifier: area },
          },
        },
        sector: {
          connectOrCreate: {
            where: { identifier: sector },
            create: { identifier: sector },
          },
        },
        vatNumber,
        otherNames,
        description,
        actual,
        reason,
        status: {
          connectOrCreate: {
            where: { identifier: status },
            create: { identifier: status },
          },
        },
        contractNumber,
        dateOfContract,
        license: {
          connectOrCreate: {
            where: { identifier: license },
            create: { identifier: license, basicUsd },
          },
        },
        licenseDetail: {
          connectOrCreate: {
            where: { identifier: licenseDetail },
            create: { identifier: licenseDetail },
          },
        },
        addedPercentage,
        gross,
        net: calcNet(gross),
        vat: calcVat(gross),
        comment,
        accountantName,
        accountantEmail,
        boxCity: {
          connectOrCreate: {
            where: { identifier: boxCity },
            create: { identifier: boxCity },
          },
        },
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
        deliveryCity: {
          connectOrCreate: {
            where: { identifier: deliveryCity },
            create: { identifier: deliveryCity },
          },
        },
        databases: {
          create: databases.split(', ').map((databaseName) => ({
            databaseName,
          })),
        },
        operators: {
          create: {
            operatorName: operatorName,
            operatorEmail: operatorEmail,
          },
        },
      },
    });
  }

  return json({ success: true });
  // return redirect(AppLinks.Customers);
}

export default function UsersPage() {
  const user = useUser();
  useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const { getNameProp, isProcessing } = useForm(fetcher.data, Schema);

  useEffect(() => {
    if (hasSuccess(fetcher.data)) {
      toast.success('Imported successfully', { duration: 5_000 });
    }
  }, [fetcher.data]);

  const [rows, setRows] = useState<(ParsedExcelRow | Error)[]>([]);
  const [error, setError] = useState('');

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      try {
        if (!event.target.files) {
          return;
        }
        setError('');
        const files = Array.from(event.target.files);
        const rawRows = await readXlsxFile(files[0]);
        if (!rawRows.length) {
          throw new Error('No rows found on spreadsheet');
        }
        if (rawRows.length === 1) {
          throw new Error(
            'Only found one row, note that the first row is meant for column headings'
          );
        }
        const [headingRow, ...dataRows] = rawRows;
        const namedColumns = EXCEL_TABLE_COLUMNS.map(([columnName, _]) => {
          const match = headingRow.find((cell) => cell === columnName);
          if (!match) {
            return { index: undefined, columnName };
          }
          return { index: headingRow.indexOf(match), columnName };
        });
        const orderedRows = dataRows.map((row) => {
          return namedColumns.map((namedColumn) => {
            if (!namedColumn.index) {
              return undefined;
            }
            const match = row[namedColumn.index];
            if (!match) {
              return undefined;
            }
            return match;
          });
        });
        const parsedRows = orderedRows.map((row) => {
          const result = ExcelRowSchema.safeParse(row);
          if (!result.success) {
            console.log(row);
            console.log(result.error.flatten());
            return new Error(stringifyZodError(result.error));
          }
          return result.data;
        });
        setRows(parsedRows);
      } catch (error) {
        console.log(error);
        return setError(
          getErrorMessage(error) ||
            'Something went wrong reading excel file, please try again'
        );
      }
    },
    []
  );

  return (
    <div className="flex min-h-full flex-col items-stretch">
      <Toolbar currentUserName={user.username} />
      <div className="flex grow flex-col items-stretch py-6">
        <CenteredView className="gap-6 px-2">
          <div className="flex flex-col items-stretch">
            <Card>
              <div className="flex flex-row items-center justify-start gap-4 border-b border-b-zinc-200 px-4 py-2">
                <div className="flex flex-col items-start justify-center">
                  <h2 className="text-lg font-semibold">Import From Excel</h2>
                  {!!error && <InlineAlert>{error}</InlineAlert>}
                </div>
                <div className="grow" />
                {!!rows.filter((row) => !(row instanceof Error)).length && (
                  <fetcher.Form method="post">
                    <ActionContextProvider
                      {...fetcher.data}
                      isSubmitting={isProcessing}
                    >
                      <input
                        type="hidden"
                        {...getNameProp('rows')}
                        value={JSON.stringify(
                          rows.filter((row) => !(row instanceof Error))
                        )}
                      />
                      <PrimaryButton
                        type="submit"
                        className="bg-green-600 hover:bg-green-800 focus:bg-green-800"
                      >
                        <div className="flex flex-row items-center gap-4">
                          <Check className="text-white" size={18} />
                          <span>Add These Rows</span>
                        </div>
                      </PrimaryButton>
                    </ActionContextProvider>
                  </fetcher.Form>
                )}
                <label htmlFor="excelFile">
                  <InputFileLabel />
                </label>
                <input
                  type="file"
                  id="excelFile"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  disabled={false}
                  className="top-0, invisible absolute left-0"
                />
              </div>
              <div className="flex flex-col items-stretch justify-center overflow-auto p-4 shadow-inner">
                <table className="table-auto border-collapse text-left">
                  <thead className="divide-y rounded border border-zinc-200">
                    <tr className="divide-x border border-zinc-200">
                      {EXCEL_TABLE_COLUMNS.map(([col, _], index) => (
                        <th key={index} className="whitespace-nowrap px-2 py-1">
                          <span className="text-base font-semibold text-zinc-800">
                            {col}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  {!rows.length && (
                    <>
                      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-6 rounded-md bg-white px-12 py-6 shadow-2xl">
                        <span className="text-base text-zinc-600">
                          No excel file selected yet
                        </span>
                        <label htmlFor="excelFile">
                          <InputFileLabel />
                        </label>
                      </div>
                      <tbody className="text-base">
                        {[...Array(10).keys()].map((key) => (
                          <tr
                            key={key}
                            className="divide-x divide-zinc-200 border border-zinc-200"
                          >
                            {EXCEL_TABLE_COLUMNS.map((_, index) => (
                              <td
                                key={index}
                                className="whitespace-nowrap bg-zinc-100 p-2"
                              >
                                <span className="invisible text-base font-normal text-zinc-400">
                                  Placeholder text
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                  {!!rows.length && (
                    <tbody className="text-base">
                      {rows.map((row, index) => (
                        <tr
                          key={index}
                          className="divide-x divide-zinc-200 border border-zinc-200"
                        >
                          {row instanceof Error && (
                            <td colSpan={39} className="bg-red-100 p-2">
                              <span className="font-light text-red-600">
                                {row.message}
                              </span>
                            </td>
                          )}
                          {!(row instanceof Error) && (
                            <>
                              {row.map((cell, index) => (
                                <td
                                  key={index}
                                  className="whitespace-nowrap bg-green-50 p-2"
                                >
                                  {!cell && (
                                    <span className="text-base font-light">
                                      -
                                    </span>
                                  )}
                                  {!!cell && (
                                    <span className="text-base font-light">
                                      {cell.toString()}
                                    </span>
                                  )}
                                </td>
                              ))}
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>
            </Card>
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

function InputFileLabel() {
  return (
    <div
      className={twMerge(
        'cursor-pointer',
        'rounded-md px-4 py-2 text-center text-base text-white shadow-lg transition-all duration-150',
        'bg-indigo-600 hover:bg-indigo-800 focus:bg-indigo-800 focus:outline-indigo-800'
      )}
    >
      Browse For File
    </div>
  );
}

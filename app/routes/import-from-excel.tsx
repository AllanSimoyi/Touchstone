import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import type { ChangeEvent } from 'react';
import type { Cell } from 'read-excel-file/types';

import { json, redirect } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useCallback, useState } from 'react';
import readXlsxFile from 'read-excel-file';
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
import { PrimaryButton } from '~/components/PrimaryButton';
import { Toolbar } from '~/components/Toolbar';
import { processBadRequest } from '~/models/core.validations';
import { EXCEL_TABLE_COLUMNS } from '~/models/excel';
import { getRawFormFields } from '~/models/forms';
import { AppLinks } from '~/models/links';
import { logParseError } from '~/models/logger.server';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  return json(null);
};

const Schema = z.object({
  rows: z.string(),
});

export async function action({ request }: ActionArgs) {
  await requireUserId(request);

  const fields = await getRawFormFields(request);
  const result = Schema.safeParse(fields);
  if (!result.success) {
    logParseError(request, result.error, fields);
    return processBadRequest(result.error, fields);
  }

  return redirect(AppLinks.Customers);
}

// interface CustomCell {
//   id: (typeof EXCEL_TABLE_COLUMNS)[number];
//   value: Cell;
// }

export default function UsersPage() {
  const user = useUser();
  useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const { getNameProp, isProcessing } = useForm(fetcher.data, Schema);

  const [rows, setRows] = useState<(Cell | undefined)[][]>([]);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) {
        return;
      }
      const files = Array.from(event.target.files);
      const [headingRow, ...rows] = await readXlsxFile(files[0]);
      const colIndices = EXCEL_TABLE_COLUMNS.map((columnName) => {
        const match = headingRow.find((cell) => cell === columnName);
        if (!match) {
          return { index: undefined, columnName };
        }
        return { index: headingRow.indexOf(match), columnName };
      });
      const preppedRows = rows.map((row) => {
        return colIndices.map((colIndex) => {
          if (!colIndex.index) {
            return undefined;
          }
          const match = row[colIndex.index];
          if (!match) {
            return undefined;
          }
          return match;
        });
      });
      setRows(preppedRows);
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
                <h2 className="text-lg font-semibold">Import From Excel</h2>
                <div className="grow" />
                {!!rows.length && (
                  <fetcher.Form method="post">
                    <ActionContextProvider
                      {...fetcher.data}
                      isSubmitting={isProcessing}
                    >
                      <input
                        type="hidden"
                        {...getNameProp('rows')}
                        value={JSON.stringify(rows)}
                      />
                      <PrimaryButton
                        type="submit"
                        className="bg-green-600 hover:bg-green-800 focus:bg-green-800"
                      >
                        <div className="flex flex-row items-center gap-4">
                          <Check className="text-white" size={18} />
                          <span>Apply These Rows</span>
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
                      {EXCEL_TABLE_COLUMNS.map((col, index) => (
                        <th key={index} className="whitespace-nowrap px-2 py-1">
                          <span className="text-sm font-semibold text-zinc-800">
                            {col}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  {!rows.length && (
                    <>
                      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-6 rounded-md bg-white px-12 py-6 shadow-2xl">
                        <span className="text-sm text-zinc-600">
                          No excel file selected yet
                        </span>
                        <label htmlFor="excelFile">
                          <InputFileLabel />
                        </label>
                      </div>
                      <tbody className="text-sm">
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
                                <span className="invisible text-sm font-normal text-zinc-400">
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
                    <tbody className="text-sm">
                      {rows.map((row, index) => (
                        <tr
                          key={index}
                          className="divide-x divide-zinc-200 border border-zinc-200"
                        >
                          {row.map((cell, index) => (
                            <td
                              key={index}
                              className={twMerge(
                                'whitespace-nowrap bg-green-50 p-2',
                                !cell && 'bg-red-200'
                              )}
                            >
                              {!cell && (
                                <span className="text-sm font-light">-</span>
                              )}
                              {!!cell && (
                                <span className="text-sm font-light">
                                  {cell.toString()}
                                </span>
                              )}
                            </td>
                          ))}
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
        'rounded-md px-4 py-2 text-center text-sm text-white shadow-lg transition-all duration-150',
        'bg-indigo-600 hover:bg-indigo-800 focus:bg-indigo-800 focus:outline-indigo-800'
      )}
    >
      Browse For File
    </div>
  );
}

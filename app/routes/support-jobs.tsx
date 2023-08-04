import type { ChangeEvent } from 'react';

import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useCallback } from 'react';
import readXlsxFile from 'read-excel-file';

import { prisma } from '~/db.server';
import { getErrorMessage } from '~/models/errors';
import { requireUserId } from '~/session.server';

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  const customers = await prisma.account.findMany({
    select: { companyName: true },
  });

  return json({ customers });
}

export default function SupportJobs() {
  const { customers } = useLoaderData<typeof loader>();

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      try {
        if (!event.target.files) {
          return;
        }
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
        console.log('Headings', headingRow);
        const customerNames = dataRows
          .map((row) => row[1]?.toString())
          .filter(Boolean);
        console.log(
          'Existing customers',
          customerNames.filter((c) =>
            customers.some((el) => el.companyName === c)
          )
        );
        console.log(
          'New customers',
          customerNames.filter((c) =>
            customers.every((el) => el.companyName !== c)
          )
        );

        const supportTypes = dataRows
          .map((row) => row[2]?.toString())
          .filter(Boolean);
        const distinctSupportTypes = new Set(supportTypes);
        console.log('distinctSupportTypes', distinctSupportTypes);

        const statuses = dataRows
          .map((row) => row[5]?.toString())
          .filter(Boolean);
        const distinctStatuses = new Set(statuses);
        console.log('distinctStatuses', distinctStatuses);
      } catch (error) {
        console.log(error);
        window.alert(getErrorMessage(error));
      }
    },
    [customers]
  );

  return (
    <div>
      <h1>Support Jobs</h1>
      <input
        type="file"
        id="excelFile"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        disabled={false}
      />
    </div>
  );
}

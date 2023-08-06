import type { ChangeEvent } from 'react';

import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useCallback } from 'react';
import readXlsxFile from 'read-excel-file';
import { z, ZodError } from 'zod';

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
  useLoaderData<typeof loader>();

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
        const [, ...dataRows] = rawRows;
        // console.log('Headings', headingRow);

        const CustomSupportTypeSchema = z.enum([
          'telephone and email support',
          'remote support',
          'email and telephone support',
          'telephone support',
          'technical support',
          'telephone and remote support',
          'inhouse consultation',
          'inhouse support',
          'personal machine consult',
          'in office technical support',
          'oinhouse support',
          'in office consultation support',
          'technical in office network support',
          'email support',
        ]);

        const CustomStatusSchema = z.enum([
          'finalised',
          'completed',
          'in process however progress made with developer of screen reader',
          'in progress',
          'backup inprocess',
          'InProgress',
        ]);

        const Schema = z.tuple([
          z.string().or(z.null()),
          z.string(),
          CustomSupportTypeSchema,
          z.string(),
          z.string(),
          CustomStatusSchema,
          z.date(),
          // z
          //   .string()
          //   .refine((arg) => arg.split('-')[0])
          //   .transform(Number),
        ]);
        // string
        // Customer Name
        // Support Type
        // Support Enquiry
        // Solution
        // Status
        // date

        const parsedRows = dataRows.map((row) => {
          const result = Schema.safeParse(row);
          if (!result.success) {
            return result.error;
          }
          return result.data;
        });

        const erredRows = parsedRows.filter((row) => row instanceof ZodError);
        console.log('erredRows', erredRows);

        const correctRows = parsedRows.filter(
          (row) => !(row instanceof ZodError)
        );
        console.log('correct rows', correctRows);

        // const customerNames = dataRows
        //   .map((row) => row[1]?.toString())
        //   .filter(Boolean);
        // console.log(
        //   'Existing customers',
        //   customerNames.filter((c) =>
        //     customers.some((el) => el.companyName === c)
        //   )
        // );
        // console.log(
        //   'New customers',
        //   customerNames.filter((c) =>
        //     customers.every((el) => el.companyName !== c)
        //   )
        // );

        // const supportTypes = dataRows
        //   .map((row) => row[2]?.toString())
        //   .filter(Boolean);
        // const distinctSupportTypes = new Set(supportTypes);
        // console.log('distinctSupportTypes', distinctSupportTypes);

        // const statuses = dataRows
        //   .map((row) => row[5]?.toString())
        //   .filter(Boolean);
        // const distinctStatuses = new Set(statuses);
        // console.log('distinctStatuses', distinctStatuses);
      } catch (error) {
        console.log(error);
        window.alert(getErrorMessage(error));
      }
    },
    []
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

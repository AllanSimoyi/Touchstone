import type { LoaderArgs } from '@remix-run/node';
import type { ChangeEvent } from 'react';
import type { SupportJobStatus, SupportJobType } from '~/models/support-jobs';

import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useCallback, useState } from 'react';
import readXlsxFile from 'read-excel-file';
import { ZodError, z } from 'zod';

import { prisma } from '~/db.server';
import { useActionErrors } from '~/hooks/useActionErrors';
import {
  hasSuccess,
  type AddSupportJobSchema,
} from '~/models/core.validations';
import { getErrorMessage } from '~/models/errors';
import { AppLinks } from '~/models/links';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  const customers = await prisma.account.findMany({
    select: { companyName: true },
  });

  return json({ customers });
}

export default function SupportJobs() {
  const currentUser = useUser();
  useLoaderData<typeof loader>();

  const [arr, setArr] = useState<any[]>([]);

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
        ]);

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
          (row): row is Exclude<(typeof parsedRows)[number], ZodError> =>
            !(row instanceof ZodError)
        );
        console.log('correct rows', correctRows);

        function mapSupportTypes(key: string) {
          const mapping: [string, SupportJobType[]][] = [
            ['telephone and email support', ['Telephone', 'Email']],
            ['remote support', ['Remote']],
            ['email and telephone support', ['Email', 'Telephone']],
            ['telephone support', ['Telephone']],
            ['technical support', ['Technical']],
            ['telephone and remote support', ['Telephone', 'Remote']],
            ['inhouse consultation', ['Inhouse']],
            ['inhouse support', ['Inhouse']],
            ['personal machine consult', ['Personal device']],
            ['in office technical support', ['In office']],
            ['oinhouse support', ['Inhouse']],
            ['in office consultation support', ['In office']],
            ['technical in office network support', ['In office', 'Network']],
            ['email support', ['Email']],
          ];
          return mapping.find((el) => el[0] === key)?.[1] || undefined;
        }

        function mapStatus(key: string) {
          const mapping: [string, SupportJobStatus][] = [
            ['finalised', 'Finalised'],
            ['completed', 'Completed'],
            [
              'in process however progress made with developer of screen reader',
              'In progress',
            ],
            ['in progress', 'In progress'],
            ['backup inprocess', 'In progress'],
            ['InProgress', 'In progress'],
          ];
          return mapping.find((el) => el[0] === key)?.[1] || undefined;
        }

        setArr(
          correctRows.map((row) => {
            const [, company, supportType, enquiry, actionTaken, status, date] =
              row;
            const details: Omit<
              z.infer<typeof AddSupportJobSchema>,
              'date' | 'supportType'
            > & {
              date: string;
              supportType: string;
            } = {
              recordType: 'SupportJob',
              company,
              clientStaffName: '-',
              supportPerson: 'Aidan',
              supportType: JSON.stringify(mapSupportTypes(supportType) || []),
              status: mapStatus(status) || 'Finalised',
              enquiry,
              actionTaken,
              charge: 0,
              date: date.toString(),
              userId: currentUser.id,
            };
            return details;
          })
        );

        // for (let row of correctRows) {
        //   const [, company, supportType, enquiry, actionTaken, status, date] =
        //     row;
        //   const details: Omit<
        //     z.infer<typeof AddSupportJobSchema>,
        //     'date' | 'supportType'
        //   > & {
        //     date: string;
        //     supportType: string;
        //   } = {
        //     recordType: 'SupportJob',
        //     company,
        //     clientStaffName: '-',
        //     supportPerson: 'Aidan',
        //     supportType: JSON.stringify(mapSupportTypes(supportType) || []),
        //     status: mapStatus(status) || 'Finalised',
        //     enquiry,
        //     actionTaken,
        //     charge: 0,
        //     date: date.toString(),
        //     userId: currentUser.id,
        //   };
        //   return submit(details, {
        //     action: AppLinks.AddRecord,
        //     method: 'post',
        //   });
        // }
      } catch (error) {
        console.log(error);
        window.alert(getErrorMessage(error));
      }
    },
    [currentUser.id]
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
      {arr.map((el, index) => (
        <Sub key={index} details={el} />
      ))}
    </div>
  );
}

interface Props {
  details: any;
}
function Sub(props: Props) {
  const { details } = props;
  const { submit, ...fetcher } = useFetcher();

  const actionErrors = useActionErrors(fetcher.data);
  if (actionErrors) {
    console.log('actionErrors', actionErrors);
  }

  const handleClick = useCallback(() => {
    return submit(details, {
      action: AppLinks.AddRecord,
      method: 'post',
    });
  }, [submit, details]);

  return (
    <div>
      <button type="button" onClick={handleClick}>
        {fetcher.state === 'idle' ? 'Chilled' : 'Adding...'}
      </button>
      {hasSuccess(fetcher.data) && <span>SUCCESS!</span>}
      <span>{fetcher.state}</span>
      {!!actionErrors && <span>Errors: {actionErrors}</span>}
    </div>
  );
}

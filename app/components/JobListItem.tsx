import type { z } from 'zod';
import type { DeleteRecordSchema } from '~/models/core.validations';
import type { SupportJobStatus, SupportJobType } from '~/models/support-jobs';

import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

import { useActionErrors } from '~/hooks/useActionErrors';
import { useDelete } from '~/hooks/useDelete';
import { hasSuccess } from '~/models/core.validations';
import { AppLinks } from '~/models/links';
import { pad } from '~/models/strings';

import { Card } from './Card';
import { Chip } from './Chip';
import { ConfirmDelete } from './ConfirmDelete';
import { HighlightText } from './HighlightText';
import { InlineAlert } from './InlineAlert';
import { ListItemDetail } from './ListItemDetail';
import { TableDropDownMenu } from './TableDropDownMenu';

interface Props {
  id: number;
  account: { id: number; companyName: string };
  clientStaffName: string;
  supportPerson: { id: number; username: string };
  supportTypes: SupportJobType[];
  status: SupportJobStatus;
  enquiry: string;
  actionTaken: string;
  charge: string;
  date: string;
  user: { id: number; username: string };
  menuIsDisabled?: boolean;
}
export function JobListItem(props: Props) {
  const {
    id,
    account,
    clientStaffName,
    supportPerson,
    supportTypes,
    status,
    enquiry,
    actionTaken,
    charge,
    date,
    user,
    menuIsDisabled,
  } = props;

  const fetcher = useFetcher();
  const deleteErrors = useActionErrors(fetcher.data);

  const { isOpen, askForConfirmation, closeModal, onConfirmed } = useDelete({
    handleDelete: () => {
      const data: z.infer<typeof DeleteRecordSchema> = {
        id,
        recordType: 'SupportJob',
      };
      return fetcher.submit(data, {
        action: AppLinks.DeleteRecord,
        method: 'post',
      });
    },
  });

  useEffect(() => {
    if (hasSuccess(fetcher.data)) {
      toast.success('Support job deleted');
    }
  }, [fetcher.data]);

  const isDeleting = fetcher.state !== 'idle';
  if (isDeleting) {
    return null;
  }

  return (
    <Card
      key={id}
      className="relative flex flex-row items-stretch justify-start gap-10 p-4"
    >
      {!menuIsDisabled && (
        <div className="absolute right-2 top-2 flex flex-col items-start">
          <>
            <ConfirmDelete
              isOpen={isOpen}
              onConfirmed={onConfirmed}
              closeModal={closeModal}
            />
            <TableDropDownMenu
              actionItem={AppLinks.EditSupportJob(id)}
              identifier="Support Job"
              handleDelete={askForConfirmation}
            />
          </>
        </div>
      )}
      <div className="flex flex-col items-stretch whitespace-nowrap">
        <ListItemDetail subtitle="Job #" detail={pad(id.toString(), 4, '0')} />
      </div>
      <div className="grid grow grid-cols-1 gap-6 md:grid-cols-4">
        <ListItemDetail subtitle="Company" detail={account.companyName} />
        <ListItemDetail
          subtitle="Company Staff Member"
          detail={clientStaffName}
        />
        <ListItemDetail
          subtitle="Support Person"
          detail={
            <div className="flex flex-col items-stretch">
              <HighlightText className="font-semibold">
                {supportPerson.username}
              </HighlightText>
              {supportPerson.username !== user.username && (
                <HighlightText className="font-light text-zinc-600">
                  {`Recorded By ${user.username}`}
                </HighlightText>
              )}
            </div>
          }
        />
        <ListItemDetail
          subtitle="Status"
          detail={
            <HighlightText
              className={twMerge(
                'font-semibold',
                status === 'Finalised' && 'text-green-600',
                status === 'In progress' && 'text-orange-600',
                status === 'Completed' && 'text-blue-600'
              )}
            >
              {status}
            </HighlightText>
          }
        />
        <div className="col-span-2 flex flex-col items-stretch">
          <ListItemDetail subtitle="Enquiry" detail={enquiry} />
        </div>
        <div className="col-span-2 flex flex-col items-stretch">
          <ListItemDetail
            subtitle="Type of Work"
            detail={
              <ul className="flex flex-wrap gap-2">
                {supportTypes.map((supportType) => (
                  <li key={supportType}>
                    <Chip className="rounded bg-zinc-200 px-2 py-0">
                      <HighlightText className="font-semibold">
                        {supportType}
                      </HighlightText>
                    </Chip>
                  </li>
                ))}
              </ul>
            }
          />
        </div>
        <div className="col-span-2 flex flex-col items-stretch">
          <ListItemDetail subtitle="Action Taken" detail={actionTaken} />
        </div>
        <ListItemDetail subtitle="Charge" detail={`USD ${charge}`} />
        <ListItemDetail subtitle="Date" detail={date} />
        {!!deleteErrors && (
          <div className="flex flex-col items-start">
            <InlineAlert className="p-2 text-xs">{deleteErrors}</InlineAlert>
          </div>
        )}
      </div>
    </Card>
  );
}

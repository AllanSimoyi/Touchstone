import type { ComponentProps } from 'react';
import type { z } from 'zod';
import type { DeleteRecordSchema } from '~/models/core.validations';
import type { SupportJobStatus, SupportJobType } from '~/models/support-jobs';

import { useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useActionErrors } from '~/hooks/useActionErrors';
import { useDelete } from '~/hooks/useDelete';
import { UpdateSupportJobSchema, hasSuccess } from '~/models/core.validations';
import { hasFields, hasFormError } from '~/models/forms';
import { AppLinks } from '~/models/links';
import { pad } from '~/models/strings';
import { showToast } from '~/models/toast';

import { ActionContextProvider, useForm } from './ActionContextProvider';
import { Card } from './Card';
import { Chip } from './Chip';
import { ConfirmDelete } from './ConfirmDelete';
import { EditJob } from './EditJob';
import { HighlightText } from './HighlightText';
import { InlineAlert } from './InlineAlert';
import { InputRecordType } from './InputRecordType';
import { ListItemDetail } from './ListItemDetail';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { TableDropDownMenu } from './TableDropDownMenu';

interface Props {
  id: number;

  account: { id: number; companyName: string };
  accounts: ComponentProps<typeof EditJob>['accounts'];

  users: ComponentProps<typeof EditJob>['users'];

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
    accounts,
    users,
  } = props;

  const updateFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const deleteErrors = useActionErrors(deleteFetcher.data);

  const { getNameProp } = useForm(updateFetcher.data, UpdateSupportJobSchema);

  const { isOpen, askForConfirmation, closeModal, onConfirmed } = useDelete({
    handleDelete: () => {
      const data: z.infer<typeof DeleteRecordSchema> = {
        id,
        recordType: 'SupportJob',
      };
      return deleteFetcher.submit(data, {
        action: AppLinks.DeleteRecord,
        method: 'post',
      });
    },
  });

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (hasSuccess(updateFetcher.data)) {
      setEditMode(false);
      showToast('success', 'Support job updated');
    }
  }, [updateFetcher.data]);

  useEffect(() => {
    if (hasSuccess(deleteFetcher.data)) {
      showToast('success', 'Support job deleted');
    }
  }, [deleteFetcher.data]);

  const defaultValues: Record<
    keyof z.infer<typeof UpdateSupportJobSchema>,
    string
  > = {
    recordType: 'SupportJob',
    id: id.toString(),
    accountId: account.id.toString(),
    clientStaffName,
    supportPersonId: supportPerson.id.toString(),
    supportType: JSON.stringify(supportTypes),
    status,
    enquiry,
    actionTaken,
    charge,
    date,
    userId: user.id.toString(),
  };

  const isDeleting = deleteFetcher.state !== 'idle';
  if (isDeleting) {
    return null;
  }

  return (
    <Card
      key={id}
      className="relative flex flex-row items-stretch justify-start gap-10 p-4"
    >
      {!menuIsDisabled && !editMode && (
        <div className="absolute right-2 top-2 flex flex-col items-start">
          <>
            <ConfirmDelete
              isOpen={isOpen}
              onConfirmed={onConfirmed}
              closeModal={closeModal}
            />
            <TableDropDownMenu
              actionItem={() => setEditMode(true)}
              identifier="Support Job"
              handleDelete={askForConfirmation}
            />
          </>
        </div>
      )}
      <div className="flex flex-col items-stretch whitespace-nowrap">
        <ListItemDetail subtitle="Job #" detail={pad(id.toString(), 4, '0')} />
      </div>
      {!editMode && (
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
                <div className="flex flex-wrap gap-2">
                  {supportTypes.map((supportType) => (
                    <Chip
                      key={supportType}
                      className="rounded bg-zinc-200 px-2 py-0"
                    >
                      <HighlightText className="font-semibold">
                        {supportType}
                      </HighlightText>
                    </Chip>
                  ))}
                </div>
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
      )}
      {!!editMode && (
        <updateFetcher.Form
          method="post"
          action={AppLinks.UpdateRecord}
          className="flex grow flex-col items-stretch gap-10"
        >
          <ActionContextProvider
            {...updateFetcher.data}
            fields={
              hasFields(updateFetcher.data)
                ? updateFetcher.data.fields
                : defaultValues
            }
            isSubmitting={updateFetcher.state !== 'idle'}
          >
            <InputRecordType value={'SupportJob'} />
            <input type="hidden" {...getNameProp('id')} value={id} />
            <input type="hidden" {...getNameProp('userId')} value={user.id} />
            <EditJob
              fetcher={updateFetcher}
              accounts={accounts}
              users={users}
            />
            <div className="flex flex-row items-stretch gap-4">
              {hasFormError(updateFetcher.data) && (
                <InlineAlert>{updateFetcher.data.formError}</InlineAlert>
              )}
              <div className="grow" />
              <SecondaryButton type="button" onClick={() => setEditMode(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit">Update</PrimaryButton>
            </div>
          </ActionContextProvider>
        </updateFetcher.Form>
      )}
    </Card>
  );
}

import { useCallback, useState, type ComponentProps } from 'react';
import Select from 'react-select';
import { z } from 'zod';

import { RecordIdSchema } from '~/models/core.validations';

import { useField } from './ActionContextProvider';

type Props = ComponentProps<typeof Select> & {
  name: string;
  accounts: { id: number; companyName: string }[];
};
export function SelectCompany(props: Props) {
  const { name, accounts, ...restOfProps } = props;
  const { value, error: errors } = useField(name);

  const getParsedValue = useCallback(
    (data: string | File | undefined) => {
      if (typeof data !== 'string') {
        return undefined;
      }
      const result = RecordIdSchema.safeParse(data);
      if (!result.success) {
        return undefined;
      }
      const account = accounts.find((account) => account.id === result.data);
      if (!account) {
        return undefined;
      }
      return { value: account.id, label: account.companyName };
    },
    [accounts]
  );

  const [accountId, setAccountId] = useState(getParsedValue(value));

  const accountOptions = accounts.map((account) => ({
    value: account.id,
    label: account.companyName,
  }));

  const handleChange = useCallback((newValue: unknown) => {
    const Schema = z.object({ value: RecordIdSchema, label: z.string() });
    const result = Schema.safeParse(newValue);
    if (!result.success) {
      return;
    }
    setAccountId(result.data);
  }, []);

  return (
    <div className="flex flex-col items-stretch">
      <input type="hidden" name={name} value={accountId?.value || 0} />
      <Select
        name="selectCompany"
        classNamePrefix="select"
        options={accountOptions}
        defaultValue={accountId}
        onChange={handleChange}
        placeholder="Select company"
        classNames={{
          control: () =>
            'rounded-md border border-zinc-200 bg-zinc-50 text-base font-light shadow-inner outline-none focus:ring-1 focus:ring-zinc-400',
        }}
        {...restOfProps}
      />
      {errors?.length && (
        <span className="text-xs font-light text-red-500" id={`${name}-error`}>
          {errors.join(', ')}
        </span>
      )}
    </div>
  );
}

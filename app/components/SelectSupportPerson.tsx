import { useCallback, useState, type ComponentProps, useEffect } from 'react';
import Select from 'react-select';
import { z } from 'zod';

import { RecordIdSchema } from '~/models/core.validations';

import { useField } from './ActionContextProvider';

type Props = ComponentProps<typeof Select> & {
  clearInput?: boolean;
  name: string;
  users: { id: number; username: string }[];
  defaultUserId?: number;
};
export function SelectSupportPerson(props: Props) {
  const { clearInput, name, users, defaultUserId, ...restOfProps } = props;
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
      const user = users.find((user) => user.id === result.data);
      if (!user) {
        return undefined;
      }
      return { value: user.id, label: user.username };
    },
    [users]
  );

  const [userId, setUserId] = useState(
    getParsedValue(value) || getParsedValue(defaultUserId?.toString())
  );

  useEffect(() => {
    if (clearInput) {
      setUserId(undefined);
    }
  }, [clearInput]);

  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.username,
  }));

  const handleChange = useCallback((newValue: unknown) => {
    const Schema = z.object({ value: RecordIdSchema, label: z.string() });
    const result = Schema.safeParse(newValue);
    if (!result.success) {
      return;
    }
    setUserId(result.data);
  }, []);

  return (
    <div className="flex flex-col items-stretch">
      <input type="hidden" name={name} value={userId?.value || 0} />
      <Select
        name="selectSupportPerson"
        classNamePrefix="select"
        options={userOptions}
        key={`my_unique_select_key__${userId}`}
        value={userId}
        onChange={handleChange}
        placeholder="Select support person"
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

import { useCallback, useState, type ComponentProps, useEffect } from 'react';
import Select from 'react-select';
import { z } from 'zod';

import { SUPPORT_JOB_TYPES } from '~/models/support-jobs';

import { useField } from './ActionContextProvider';

type CustomOption = { value: string; label: string };

type Props = ComponentProps<typeof Select> & {
  clearInput?: boolean;
  name: string;
};
export function SupportTypesMultiSelect(props: Props) {
  const { clearInput, name, ...restOfProps } = props;
  const { value, error: errors } = useField(name);

  const getParsedValue = useCallback((data: string | File | undefined) => {
    if (typeof data !== 'string') {
      return undefined;
    }
    try {
      const result = z.string().array().safeParse(JSON.parse(data));
      if (!result.success) {
        return undefined;
      }
      return result.data.map((el) => ({ value: el, label: el }));
    } catch (error) {
      return undefined;
    }
  }, []);

  const [supportTypes, setSupportTypes] = useState<CustomOption[]>(
    getParsedValue(value) || []
  );

  useEffect(() => {
    if (clearInput) {
      setSupportTypes([]);
    }
  }, [clearInput]);

  const jobTypeOptions = SUPPORT_JOB_TYPES.map((el) => ({
    value: el,
    label: el,
  }));

  const handleChange = useCallback((newValue: unknown) => {
    setSupportTypes(newValue as CustomOption[]);
  }, []);

  return (
    <div className="flex flex-col items-stretch">
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(supportTypes.map((el) => el.value))}
      />
      <Select
        isMulti
        name="selectSupportTypes"
        classNamePrefix="select"
        options={jobTypeOptions}
        // defaultValue={supportTypes}
        key={`my_unique_select_key__${supportTypes.toString()}`}
        value={supportTypes}
        onChange={handleChange}
        placeholder="Select the types of work"
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

import type { ComponentProps } from 'react';

import { useField, useIsSubmitting } from './ActionContextProvider';
import { Select } from './Select';

type Props = ComponentProps<'select'> & {
  customRef?: ComponentProps<'select'>['ref'];
  name: string;
  label?: string | undefined;
};
export function FormSelect(props: Props) {
  const { name, defaultValue, disabled, ...restOfProps } = props;

  const { value, error: errors } = useField(name);
  const isSubmitting = useIsSubmitting();

  return (
    <Select
      name={name}
      errors={errors}
      disabled={isSubmitting || disabled}
      defaultValue={typeof value === 'string' ? value : defaultValue}
      {...restOfProps}
    />
  );
}

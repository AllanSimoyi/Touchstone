import type { ComponentProps } from 'react';

import { useField, useIsSubmitting } from './ActionContextProvider';
import { TextField } from './TextField';

type Props = ComponentProps<'input'> & {
  customRef?: ComponentProps<'input'>['ref'];
  name: string;
  label?: string | undefined;
};
export function FormTextField(props: Props) {
  const { name, defaultValue, disabled, ...restOfProps } = props;

  const { value, error: errors } = useField(name);
  const isSubmitting = useIsSubmitting();

  return (
    <TextField
      name={name}
      errors={errors}
      disabled={isSubmitting || disabled}
      defaultValue={typeof value === 'string' ? value : defaultValue}
      {...restOfProps}
    />
  );
}

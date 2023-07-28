import type { ComponentProps } from 'react';

import { useField, useIsSubmitting } from './ActionContextProvider';
import { TextField } from './TextField';

interface Props extends ComponentProps<typeof TextField> {
  name: string;
}
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

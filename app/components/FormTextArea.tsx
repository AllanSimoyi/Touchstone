import type { ComponentProps } from 'react';

import { useField, useIsSubmitting } from './ActionContextProvider';
import { TextArea } from './TextArea';

type Props = ComponentProps<'textarea'> & {
  customRef?: ComponentProps<'textarea'>['ref'];
  name: string;
  label?: string | undefined;
};
export function FormTextArea(props: Props) {
  const { name, disabled, defaultValue, ...restOfProps } = props;

  const { value, error: errors } = useField(name);
  const isSubmitting = useIsSubmitting();

  return (
    <TextArea
      name={name}
      errors={errors}
      disabled={isSubmitting || disabled}
      defaultValue={typeof value === 'string' ? value : defaultValue}
      {...restOfProps}
    />
  );
}

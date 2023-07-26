import type { ComponentProps } from 'react';

import { twMerge } from 'tailwind-merge';

type Props = ComponentProps<'input'> & {
  customRef?: ComponentProps<'input'>['ref'];
  name?: string | undefined;
  label?: string | undefined;
  errors?: string[];
  required?: boolean;
};
export function TextField(props: Props) {
  const {
    customRef,
    name,
    label,
    className,
    errors,
    required,
    disabled,
    ...restOfProps
  } = props;

  return (
    <div className="flex flex-col items-stretch justify-center gap-0">
      {label && (
        <span className="text-sm font-light text-zinc-600">{label}</span>
      )}
      <input
        required={required}
        ref={customRef}
        type="text"
        name={name}
        aria-invalid={!!errors?.length}
        aria-describedby={`${name}-error`}
        disabled={disabled}
        className={twMerge(
          'w-full transition-all duration-300',
          'rounded-md border border-zinc-200 bg-zinc-50 p-2 text-sm font-light shadow-inner outline-none focus:ring-1 focus:ring-zinc-400',
          disabled &&
            'cursor-not-allowed bg-zinc-200 text-zinc-600 shadow-none',
          errors?.length && 'border-2 border-red-600',
          className
        )}
        {...restOfProps}
      />
      {errors?.length && (
        <span className="text-sm font-light text-red-500" id={`${name}-error`}>
          {errors.join(', ')}
        </span>
      )}
    </div>
  );
}

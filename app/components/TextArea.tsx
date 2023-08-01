import type { ComponentProps } from 'react';

import { twMerge } from 'tailwind-merge';

type Props = ComponentProps<'textarea'> & {
  customRef?: ComponentProps<'textarea'>['ref'];
  name?: string | undefined;
  label?: string | undefined;
  errors?: string[];
  camouflage?: boolean;
};
export function TextArea(props: Props) {
  const {
    customRef,
    name,
    label,
    className,
    errors,
    rows,
    disabled,
    camouflage,
    ...restOfProps
  } = props;

  return (
    <div className="flex flex-col items-stretch justify-center gap-1">
      {label && (
        <span className="text-base font-light text-zinc-600">{label}</span>
      )}
      <textarea
        required
        ref={customRef}
        name={name}
        aria-invalid={!!errors?.length}
        aria-describedby={`${name}-error`}
        disabled={disabled}
        className={twMerge(
          'transition-all duration-150',
          'rounded-md border border-zinc-200 bg-zinc-50 p-2 text-base font-light shadow-inner outline-none focus:ring-1 focus:ring-zinc-400',
          'hover:bg-zinc-100',
          camouflage &&
            'border-none bg-transparent hover:border hover:bg-white focus:border focus:bg-white',
          disabled &&
            'cursor-not-allowed bg-zinc-200 text-zinc-600 shadow-none',
          errors?.length && 'border-2 border-red-600',
          className
        )}
        rows={rows || 4}
        {...restOfProps}
      />
      {errors?.length && (
        <div className="text-base text-red-500" id={`${name}-error`}>
          {errors.join(', ')}
        </div>
      )}
    </div>
  );
}

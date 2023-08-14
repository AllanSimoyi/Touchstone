import type { ComponentProps } from 'react';

import { twMerge } from 'tailwind-merge';

type Props = ComponentProps<'input'> & {
  customRef?: ComponentProps<'input'>['ref'];
  name?: string | undefined;
  label?: string | undefined;
  errors?: string[];
  required?: boolean;
  camouflage?: boolean;
  isRow?: boolean;
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
    camouflage,
    isRow = false,
    ...restOfProps
  } = props;

  return (
    <div className="flex flex-col items-stretch justify-center gap-0">
      <div
        className={twMerge(
          'flex flex-col items-stretch gap-0',
          isRow && 'flex-row gap-2'
        )}
      >
        {label && (
          <div
            className={twMerge(
              'flex flex-col items-start justify-center',
              isRow && 'w-[30%]'
            )}
          >
            <span className="text-base font-light text-zinc-600">{label}</span>
          </div>
        )}
        <div className="flex grow flex-col items-stretch">
          <input
            required={required}
            aria-required={required}
            ref={customRef}
            type="text"
            name={name}
            aria-invalid={!!errors?.length}
            aria-describedby={`${name}-error`}
            disabled={disabled}
            className={twMerge(
              'w-full transition-all duration-150',
              'rounded-md border border-zinc-200 p-2 text-base font-light shadow-inner outline-none focus:ring-1 focus:ring-zinc-400',
              'hover:ring-1 hover:ring-zinc-400',
              camouflage &&
                'border-none bg-transparent shadow-none hover:border hover:bg-white focus:border focus:bg-white',
              disabled &&
                'cursor-not-allowed bg-zinc-200 text-zinc-600 shadow-none',
              errors?.length && 'border-2 border-red-600',
              className
            )}
            {...restOfProps}
          />
        </div>
      </div>
      {errors?.length && (
        <span className="text-xs font-light text-red-500" id={`${name}-error`}>
          {errors.join(', ')}
        </span>
      )}
    </div>
  );
}

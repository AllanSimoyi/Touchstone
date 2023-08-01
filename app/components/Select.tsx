import type { ComponentProps } from 'react';

import { twMerge } from 'tailwind-merge';

type Props<SchemaType extends Record<string, any>> =
  ComponentProps<'select'> & {
    customRef?: ComponentProps<'select'>['ref'];
    name: keyof SchemaType;
    label?: string | undefined;
    errors?: string[];
    required?: boolean;
    isRow?: boolean;
  };
export function Select<SchemaType extends Record<string, any>>(
  props: Props<SchemaType>
) {
  const {
    customRef,
    name,
    label,
    className,
    errors,
    required,
    disabled,
    isRow = false,
    ...restOfProps
  } = props;

  return (
    <div className="flex flex-col items-stretch justify-center gap-0">
      <div
        className={twMerge(
          'flex flex-col items-stretch justify-center gap-0',
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
          <select
            required={required}
            ref={customRef}
            name={name}
            aria-invalid={!!errors?.length}
            aria-describedby={`${name}-error`}
            disabled={disabled}
            className={twMerge(
              'w-full transition-all duration-150',
              'rounded-md border border-zinc-200 bg-zinc-50 p-2 text-base font-light shadow-inner outline-none focus:ring-1 focus:ring-zinc-400',
              'hover:bg-zinc-100',
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
        <div className="text-base font-light text-red-500" id={`${name}-error`}>
          {errors.join(', ')}
        </div>
      )}
    </div>
  );
}

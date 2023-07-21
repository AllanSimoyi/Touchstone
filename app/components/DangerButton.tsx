import type { ComponentProps } from 'react';

import { twMerge } from 'tailwind-merge';

interface Props extends ComponentProps<'button'> {}
export function DangerButton(props: Props) {
  const { type = 'button', disabled, className, ...restOfProps } = props;

  return (
    <button
      type={type}
      className={twMerge(
        'rounded text-center font-semibold text-white transition-all duration-300',
        'bg-red-600 hover:bg-red-700 focus:bg-red-700 focus:outline-red-600',
        'px-4 py-2 text-sm',
        disabled && 'cursor-not-allowed bg-red-500/50',
        className
      )}
      {...restOfProps}
    />
  );
}

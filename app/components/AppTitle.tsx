import type { ComponentProps } from 'react';

import { twMerge } from 'tailwind-merge';

interface Props extends ComponentProps<'h1'> {
  large?: boolean;
}
export function AppTitle(props: Props) {
  const { large, className, ...restOfProps } = props;
  return (
    <h1
      className={twMerge(
        'text-lg font-semibold text-zinc-600',
        large && 'text-2xl',
        className
      )}
      {...restOfProps}
    >
      Touchstone
    </h1>
  );
}

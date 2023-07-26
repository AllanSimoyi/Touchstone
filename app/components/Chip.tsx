import type { ComponentProps } from 'react';

import { twMerge } from 'tailwind-merge';

interface Props extends ComponentProps<'div'> {}
export function Chip(props: Props) {
  const { className, ...restOfProps } = props;
  return (
    <div
      className={twMerge(
        'flex flex-row items-center justify-start rounded-md bg-zinc-100 p-2',
        className
      )}
      {...restOfProps}
    ></div>
  );
}

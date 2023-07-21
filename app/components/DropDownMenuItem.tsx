import type { ComponentProps } from 'react';

import { Link } from '@remix-run/react';
import { twMerge } from 'tailwind-merge';

type Props =
  | ({ mode: 'link' } & ComponentProps<typeof Link> & {
        active: boolean;
        danger?: boolean;
      })
  | ({ mode: 'button' } & ComponentProps<'button'> & {
        active: boolean;
        danger?: boolean;
      });

export function DropDownMenuItem(props: Props) {
  const {
    children,
    className: inputClassName,
    active,
    danger,
    ...restOfProps
  } = props;

  const className = twMerge(
    'group text-sm font-light flex w-full items-center rounded p-2 text-zinc-800 transition-all duration-300',
    active && (danger ? 'bg-red-50' : 'bg-zinc-200'),
    inputClassName
  );

  if (restOfProps.mode === 'button') {
    return (
      <button className={className} {...restOfProps}>
        {children}
      </button>
    );
  }

  return (
    <Link className={className} {...restOfProps}>
      {children}
    </Link>
  );
}

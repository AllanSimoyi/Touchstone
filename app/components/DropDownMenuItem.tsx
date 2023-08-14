import { Link } from '@remix-run/react';
import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

type Additional = {
  active: boolean;
  danger?: boolean;
};
type Props =
  | ({ mode: 'link' } & ComponentProps<typeof Link> & Additional)
  | ({ mode: 'button' } & ComponentProps<'button'> & Additional);

export function DropDownMenuItem(props: Props) {
  const className = twMerge(
    'group text-base font-light flex w-full items-center rounded p-2 text-zinc-800 transition-all duration-150',
    props.active && (props.danger ? 'bg-red-50' : 'bg-zinc-200'),
    props.className
  );

  if (props.mode === 'button') {
    const { ref, active, danger, ...restOfProps } = props;
    return (
      <button className={className} {...restOfProps}>
        {restOfProps.children}
      </button>
    );
  }

  const { active, danger, ...restOfProps } = props;
  return (
    <Link className={className} {...restOfProps}>
      {restOfProps.children}
    </Link>
  );
}

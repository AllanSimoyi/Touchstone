import type { RemixLinkProps } from '@remix-run/react/dist/components';
import type { ComponentProps } from 'react';

import { Link } from '@remix-run/react';
import { twMerge } from 'tailwind-merge';

interface GetClassNameProps {
  disabled: boolean | undefined;
  className: string | undefined;
}
function getClassName(props: GetClassNameProps) {
  const { disabled, className: inputClassName } = props;

  return twMerge(
    'rounded text-center font-semibold transition-all duration-150 md:bg-transparent p-2 text-zinc-600',
    'focus:bg-zinc-200 focus:outline-zinc-200 hover:bg-zinc-200',
    disabled && 'text-zinc-200',
    inputClassName
  );
}

interface Props extends ComponentProps<'button'> {}
export function GhostButton(props: Props) {
  const { disabled, className, type = 'button', ...restOfProps } = props;
  return (
    <button
      type={type}
      className={getClassName({ className, disabled })}
      disabled={disabled}
      {...restOfProps}
    />
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link>, RemixLinkProps {}
export function GhostButtonLink(props: ButtonLinkProps) {
  const { className, children, ...restOfProps } = props;
  return (
    <Link
      className={getClassName({ className, disabled: false })}
      children={children}
      {...restOfProps}
    />
  );
}

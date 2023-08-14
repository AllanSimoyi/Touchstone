import type { ComponentProps } from 'react';

import { Link } from '@remix-run/react';

import { UnderLineOnHover } from './UnderLineOnHover';

type Props = ComponentProps<typeof Link>;
export function ToolbarMenuItem(props: Props) {
  const { children, ...restOfProps } = props;
  return (
    <Link {...restOfProps}>
      <UnderLineOnHover>{children}</UnderLineOnHover>
    </Link>
  );
}

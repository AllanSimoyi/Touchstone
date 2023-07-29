import type { ComponentProps } from 'react';

import { Chip } from './Chip';

interface Props extends ComponentProps<typeof Chip> {}
export function OptimisticChip(props: Props) {
  const { children } = props;
  return (
    <Chip className="p-4">
      <span className="text-sm font-light text-zinc-400">{children}</span>
    </Chip>
  );
}

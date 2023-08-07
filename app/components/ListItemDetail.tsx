import { useMemo, type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { HighlightText } from './HighlightText';

interface Props extends ComponentProps<'div'> {
  subtitle: string;
  detail: string | number | React.ReactNode;
}
export function ListItemDetail(props: Props) {
  const { subtitle, detail, className, ...restOfProps } = props;

  const typedChild = useMemo(() => {
    if (typeof detail === 'string' || typeof detail === 'number') {
      return { type: 'primitive', detail } as const;
    }
    return { type: 'node', detail } as const;
  }, [detail]);

  return (
    <div
      className={twMerge('flex flex-col items-stretch gap-0', className)}
      {...restOfProps}
    >
      <span className="text-sm font-light text-zinc-600">{subtitle}</span>
      {typedChild.type === 'node' && (
        <div className="text-base font-light">{typedChild.detail}</div>
      )}
      {typedChild.type === 'primitive' && (
        <HighlightText className="text-base font-semibold">
          {typedChild.detail.toString()}
        </HighlightText>
      )}
    </div>
  );
}

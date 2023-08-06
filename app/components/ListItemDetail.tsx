import { useMemo, type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props extends ComponentProps<'div'> {
  subtitle: string;
  detail: string | number | React.ReactNode;
}
export function ListItemDetail(props: Props) {
  const { subtitle, detail, className, ...restOfProps } = props;

  const isNode = useMemo(() => {
    return typeof detail !== 'string' && typeof detail !== 'number';
  }, [detail]);

  return (
    <div
      className={twMerge('flex flex-col items-stretch gap-0', className)}
      {...restOfProps}
    >
      <span className="text-sm font-light text-zinc-600">{subtitle}</span>
      {isNode && <div className="text-base font-normal">{detail}</div>}
      {!isNode && <span className="text-base font-normal">{detail}</span>}
    </div>
  );
}

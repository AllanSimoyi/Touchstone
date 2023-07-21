import { twMerge } from 'tailwind-merge';

interface Props {
  large?: boolean;
}
export function AppTitle(props: Props) {
  const { large } = props;
  return (
    <h1
      className={twMerge(
        'text-lg font-semibold text-zinc-800',
        large && 'text-2xl'
      )}
    >
      Touchstone
    </h1>
  );
}

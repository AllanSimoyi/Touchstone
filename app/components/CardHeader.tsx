interface Props {
  children: React.ReactNode;
}
export function CardHeader(props: Props) {
  const { children } = props;
  return (
    <div className="flex flex-col items-start justify-center border-b border-b-zinc-200 px-2 py-2">
      <span className="text-base font-semibold text-zinc-800">{children}</span>
    </div>
  );
}

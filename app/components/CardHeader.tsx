interface Props {
  children: React.ReactNode;
}
export function CardHeader(props: Props) {
  const { children } = props;
  return (
    <div className="flex flex-col items-center justify-center border-b border-dashed border-b-zinc-200 p-4">
      <span className="text-lg font-semibold text-zinc-800">{children}</span>
    </div>
  );
}

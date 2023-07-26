import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { Chip } from './Chip';

interface Props {
  name: string;
  email: string;
}
export function AccountantDetails(props: Props) {
  const { name, email } = props;

  const values = Object.keys(props).map((key) => props[key as keyof Props]);
  if (values.every((value) => !value)) {
    return null;
  }

  const entries = (
    [
      ['Name', name],
      ['Email', email],
    ] as const
  ).filter(([_, value]) => Boolean(value));

  return (
    <div className="flex flex-col items-stretch">
      <Card>
        <CardHeader>Accountant Details</CardHeader>
        <div className="grid grid-cols-3 gap-2 p-2">
          {entries.map(([label, value]) => (
            <>
              <Chip className="font-light">{label}</Chip>
              <Chip className="col-span-2">{value}</Chip>
            </>
          ))}
        </div>
      </Card>
    </div>
  );
}

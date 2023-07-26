import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { Chip } from './Chip';

interface Props {
  contractNumber: string;
  dateOfContract: string;
}
export function ContractDetails(props: Props) {
  const { contractNumber, dateOfContract } = props;

  const values = Object.keys(props).map((key) => props[key as keyof Props]);
  if (values.every((value) => !value)) {
    return null;
  }

  const entries = (
    [
      ['Contract #', contractNumber],
      ['Contract Date', dateOfContract],
    ] as const
  ).filter(([_, value]) => Boolean(value));

  return (
    <div className="flex flex-col items-stretch">
      <Card>
        <CardHeader>Contract Details</CardHeader>
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

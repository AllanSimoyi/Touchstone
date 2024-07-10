import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { Chip } from './Chip';

interface Props {
  operators: { name: string; email: string }[];
}
export function OperatorDetails(props: Props) {
  const { operators } = props;

  return (
    <div className="flex flex-col items-stretch">
      <Card>
        <CardHeader>Payroll Operators</CardHeader>
        <div className="flex flex-col items-stretch gap-2 p-2">
          {operators.map((operator) => (
            <Chip key={operator.name}>
              {operator.name} - {operator.email}
            </Chip>
          ))}
        </div>
      </Card>
    </div>
  );
}

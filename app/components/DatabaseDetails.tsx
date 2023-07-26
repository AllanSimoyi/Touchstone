import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { Chip } from './Chip';

interface Props {
  databases: string[];
}
export function DatabaseDetails(props: Props) {
  const { databases } = props;

  return (
    <div className="flex flex-col items-stretch">
      <Card>
        <CardHeader>Databases</CardHeader>
        <div className="flex flex-col items-stretch gap-2 p-2">
          {databases.map((database) => (
            <Chip key={database}>{database}</Chip>
          ))}
        </div>
      </Card>
    </div>
  );
}

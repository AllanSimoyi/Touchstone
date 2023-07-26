import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { Chip } from './Chip';

interface Props {
  name: string;
  email: string;
  phone: string;
  fax: string;
}
export function CeoDetails(props: Props) {
  const { name, email, phone, fax } = props;

  if ([name, email, phone, fax].every((value) => !value)) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch">
      <Card>
        <CardHeader>CEO Details</CardHeader>
        <div className="grid grid-cols-3 gap-2 p-2">
          {!!name && (
            <>
              <Chip className="font-light">Name:</Chip>
              <Chip className="col-span-2">{name}</Chip>
            </>
          )}
          {!!email && (
            <>
              <Chip className="font-light">Email:</Chip>
              <Chip className="col-span-2">{email}</Chip>
            </>
          )}
          {!!phone && (
            <>
              <Chip className="font-light">Phone:</Chip>
              <Chip className="col-span-2">{phone}</Chip>
            </>
          )}
          {!!fax && (
            <>
              <Chip className="font-light">Fax:</Chip>
              <Chip className="col-span-2">{fax}</Chip>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

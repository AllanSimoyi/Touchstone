import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { Chip } from './Chip';

interface Props {
  addr: string;
  tel: string;
  fax: string;
  cell: string;
}
export function ContactDetails(props: Props) {
  const { addr, tel, fax, cell } = props;

  if ([addr, tel, fax, cell].every((value) => !value)) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch">
      <Card>
        <CardHeader>Contact Details</CardHeader>
        <div className="grid grid-cols-3 gap-2 p-2">
          {!!addr && (
            <>
              <Chip className="font-light">Address:</Chip>
              <Chip className="col-span-2">{addr}</Chip>
            </>
          )}
          {!!tel && (
            <>
              <Chip className="font-light">Tel:</Chip>
              <Chip className="col-span-2">{tel}</Chip>
            </>
          )}
          {!!fax && (
            <>
              <Chip className="font-light">Fax:</Chip>
              <Chip className="col-span-2">{fax}</Chip>
            </>
          )}
          {!!cell && (
            <>
              <Chip className="font-light">Cell:</Chip>
              <Chip className="col-span-2">{cell}</Chip>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

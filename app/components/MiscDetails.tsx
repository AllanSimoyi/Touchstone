import { Fragment } from 'react';

import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { Chip } from './Chip';

interface Props {
  group: string;
  area: string;
  sector: string;
  tin: string;
  vatNumber: string;
}
export function MiscDetails(props: Props) {
  const { group, area, sector, tin, vatNumber } = props;

  const values = Object.keys(props).map((key) => props[key as keyof Props]);
  if (values.every((value) => !value)) {
    return null;
  }

  const entries = (
    [
      ['Group', group],
      ['Area', area],
      ['Sector', sector],
      ['TIN', tin],
      ['VAT #', vatNumber],
    ] as const
  ).filter(([_, value]) => Boolean(value));

  return (
    <div className="flex flex-col items-stretch">
      <Card>
        <CardHeader>Misc Details</CardHeader>
        <div className="grid grid-cols-3 gap-2 p-2">
          {entries.map(([label, value]) => (
            <Fragment key={label}>
              <Chip className="font-light">{label}</Chip>
              <Chip className="col-span-2">{value}</Chip>
            </Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}

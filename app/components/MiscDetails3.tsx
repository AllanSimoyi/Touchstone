import { Fragment } from 'react';

import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { Chip } from './Chip';

interface Props {
  box: string;
  deliveryAddr: string;
  description: string;
  comment: string;
}
export function MiscDetails3(props: Props) {
  const { box, deliveryAddr, description, comment } = props;

  const values = Object.keys(props).map((key) => props[key as keyof Props]);
  if (values.every((value) => !value)) {
    return null;
  }

  const entries = (
    [
      ['Box Info', box],
      ['Delivery Address', deliveryAddr],
      ['Description', description],
      ['Comment', comment],
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

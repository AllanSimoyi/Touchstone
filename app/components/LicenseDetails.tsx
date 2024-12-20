import { Fragment } from 'react';

import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { Chip } from './Chip';

interface Props {
  license: { identifier: string; basicUsd: string } | undefined;
  licenseDetail: string;
  addedPercentage: number;
  gross: number;
  net: number;
  vat: number;
}
export function LicenseDetails(props: Props) {
  const { license, licenseDetail, addedPercentage, gross, net, vat } = props;

  const values = Object.keys(props).map((key) => props[key as keyof Props]);
  if (values.every((value) => !value)) {
    return null;
  }

  const entries = (
    [
      [
        'License',
        license ? `${license.identifier} - USD ${license.basicUsd}` : '-',
      ],
      ['License Detail', licenseDetail],
      ['Added %', `${addedPercentage}%`],
      ['Gross', `USD ${gross.toLocaleString()}`],
      ['Net', `USD ${net.toLocaleString()}`],
      ['Vat', `USD ${vat.toLocaleString()}`],
    ] as const
  ).filter(([_, value]) => Boolean(value));

  return (
    <div className="flex flex-col items-stretch">
      <Card>
        <CardHeader>License Details</CardHeader>
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

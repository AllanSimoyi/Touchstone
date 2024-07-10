import { Link } from '@remix-run/react';
import { Fragment } from 'react';
import { ChevronRight } from 'tabler-icons-react';

import { UnderLineOnHover } from './UnderLineOnHover';

interface Props {
  items: (string | [string, string])[];
}
export function Breadcrumb(props: Props) {
  const { items } = props;

  return (
    <div className="flex flex-row items-stretch gap-2 text-2xl font-semibold">
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <div className="flex flex-col items-center justify-center">
              <ChevronRight className="text-zinc-400" />
            </div>
          )}
          {typeof item === 'string' && (
            <span className="text-zinc-800">{item}</span>
          )}
          {typeof item !== 'string' && (
            <Link to={item[0]}>
              <UnderLineOnHover>
                <span className="text-zinc-400 transition-all duration-150 hover:text-zinc-800">
                  {item[1]}
                </span>
              </UnderLineOnHover>
            </Link>
          )}
        </Fragment>
      ))}
    </div>
  );
}

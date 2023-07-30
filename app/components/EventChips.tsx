import type {
  CreateOrDeleteEventDetails,
  EventFieldValue,
  UpdateEventDetails,
} from '~/models/events';

import { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

import { EventKind } from '~/models/events';

import { Chip } from './Chip';

interface Props {
  data:
    | {
        kind: EventKind.Create;
        details: CreateOrDeleteEventDetails;
      }
    | {
        kind: EventKind.Delete;
        details: CreateOrDeleteEventDetails;
      }
    | {
        kind: EventKind.Update;
        details: UpdateEventDetails;
      };
}
export function EventChips(props: Props) {
  const { data } = props;
  const detailsToArr = useCallback((details: CreateOrDeleteEventDetails) => {
    return Object.keys(details).map((key) => [key, details[key]] as const);
  }, []);

  const updateDetailsToArrs = useCallback((details: UpdateEventDetails) => {
    const fromDetails = Object.keys(details).map(
      (key) => [key, details[key].from] as const
    );
    const toDetails = Object.keys(details).map(
      (key) => [key, details[key].to] as const
    );
    return { fromDetails, toDetails };
  }, []);

  if (data.kind === EventKind.Create) {
    return <Row mode={'green'} items={detailsToArr(data.details)} />;
  }

  if (data.kind === EventKind.Delete) {
    return <Row mode={'red'} items={detailsToArr(data.details)} />;
  }

  const { fromDetails, toDetails } = updateDetailsToArrs(data.details);
  return (
    <div className="flex flex-col items-stretch gap-1">
      <Row mode={'red'} items={fromDetails} />
      <Row mode={'green'} items={toDetails} />
    </div>
  );
}

interface RowProps {
  mode: 'red' | 'green';
  items: (readonly [string, EventFieldValue])[];
}
function Row(props: RowProps) {
  const { items, mode } = props;
  return (
    <div className="flex flex-row items-stretch gap-2">
      {items.map(([key, value]) => (
        <Chip
          key={key}
          className={twMerge(
            'px-2 py-1',
            mode === 'red' ? ' text-red-600' : ' text-green-600'
            // mode === 'red'
            //   ? 'bg-red-50 text-red-600'
            //   : 'bg-green-50 text-green-600'
          )}
        >
          <span className="font-light">{key}</span>:&nbsp;
          <span className="font-semibold">{value.toString()}</span>
        </Chip>
      ))}
    </div>
  );
}

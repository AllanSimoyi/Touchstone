import type { ComponentProps } from 'react';

import { AccordionItem } from './AccordionItem';

interface Props {
  items: ComponentProps<typeof AccordionItem>[];
}
export function Accordion(props: Props) {
  const { items } = props;

  return (
    <div className="flex flex-col items-stretch gap-4">
      {items.map((item, index) => (
        <AccordionItem key={index} {...item} />
      ))}
    </div>
  );
}

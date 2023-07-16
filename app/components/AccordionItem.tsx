import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDown } from 'tabler-icons-react';
import { twMerge } from 'tailwind-merge';

import { GhostButton } from './GhostButton';

interface Props {
  header: string | React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function AccordionItem(props: Props) {
  const { header, className, children } = props;

  return (
    <div className="flex flex-col items-stretch">
      <Disclosure>
        {({ open }) => (
          <>
            {typeof header === 'string' && (
              <Disclosure.Button
                as="button"
                className={twMerge(
                  'flex flex-row items-stretch rounded border-b border-b-zinc-200 p-6',
                  className
                )}
              >
                <div className="flex flex-col items-start">
                  <span className="text-base text-slate-800">{header}</span>
                </div>
                <div className="grow" />
                <div className="flex flex-col items-center justify-center">
                  <GhostButton>
                    <ChevronDown
                      className="font-bold text-slate-800"
                      size={18}
                    />
                  </GhostButton>
                </div>
              </Disclosure.Button>
            )}
            {header !== 'string' && (
              <Disclosure.Button
                as="button"
                className="flex flex-col items-stretch"
              >
                {header}
              </Disclosure.Button>
            )}
            <Transition
              show={open}
              enter="transition duration-100 ease-out"
              enterFrom="transform -translate-y-10 opacity-0"
              enterTo="transform translate-y-0 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform translate-y-0 opacity-100"
              leaveTo="transform -translate-y-10 opacity-0"
            >
              <Disclosure.Panel static>{children}</Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
}

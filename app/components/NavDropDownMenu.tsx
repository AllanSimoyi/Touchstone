import { Menu, Transition } from '@headlessui/react';
import { Link } from '@remix-run/react';
import { Fragment } from 'react';
import { ChevronDown } from 'tabler-icons-react';
import { twMerge } from 'tailwind-merge';

import { AppLinks } from '~/models/links';

interface Props {
  title: string;
  items: [string, string][];
}
export function NavDropDownMenu(props: Props) {
  const { title, items } = props;

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button
            type="button"
            className="flex flex-row items-center gap-2 rounded p-2 transition-all duration-150 hover:bg-zinc-100"
          >
            {title}
            <ChevronDown className="text-zinc-600" />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 z-50 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1">
              {items.map(([link, caption], index) => (
                <Menu.Item key={index}>
                  {({ active }) => {
                    const isBackup = link === AppLinks.Backup;
                    const className = twMerge(
                      'group text-base font-light flex w-full items-center rounded p-2 text-zinc-800 transition-all duration-150',
                      active && 'bg-zinc-200'
                    );
                    return (
                      <div>
                        <Link
                          to={link}
                          className={className}
                          target={isBackup ? '_blank' : undefined}
                          rel={isBackup ? 'noopener noreferrer' : undefined}
                        >
                          {caption}
                        </Link>
                      </div>
                    );
                  }}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

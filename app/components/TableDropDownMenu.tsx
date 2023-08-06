import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Dots } from 'tabler-icons-react';

import { DropDownMenuItem } from './DropDownMenuItem';

interface Props {
  identifier: string;
  actionItem: string | (() => void);
  handleDelete: () => void;
}

export function TableDropDownMenu(props: Props) {
  const { handleDelete, identifier, actionItem } = props;

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button
            type="button"
            className="rounded p-2 transition-all duration-150 hover:bg-zinc-100"
          >
            <Dots data-testid="menu" size={20} />
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
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => {
                  if (typeof actionItem === 'string') {
                    return (
                      <DropDownMenuItem
                        mode="link"
                        active={active}
                        to={actionItem}
                      >
                        Edit {identifier}
                      </DropDownMenuItem>
                    );
                  }
                  return (
                    <DropDownMenuItem
                      mode="button"
                      active={active}
                      onClick={actionItem}
                    >
                      Edit {identifier}
                    </DropDownMenuItem>
                  );
                }}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <DropDownMenuItem
                    mode="button"
                    active={active}
                    onClick={handleDelete}
                    danger
                  >
                    <span className="text-red-600">Delete {identifier}</span>
                  </DropDownMenuItem>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

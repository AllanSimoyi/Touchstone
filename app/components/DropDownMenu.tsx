import { Menu, Transition } from '@headlessui/react';
import { Form, Link } from '@remix-run/react';
import { Fragment, useMemo } from 'react';
import { DotsVertical } from 'tabler-icons-react';
import { twMerge } from 'tailwind-merge';

import { AppLinks } from '~/models/links';

interface Props {
  loggedIn: boolean;
}
export function DropDownMenu(props: Props) {
  const { loggedIn } = props;

  const menuItems: [string, string][] = useMemo(() => {
    if (!loggedIn) {
      return [
        [AppLinks.Login, 'Log In'],
        [AppLinks.Join, 'Create Account'],
      ];
    }
    return [
      [AppLinks.MyAccount, 'My Account'],
      [AppLinks.PickLists, 'Pick Lists'],
    ];
  }, [loggedIn]);

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button
            type="button"
            className="rounded p-2 transition-all duration-150 hover:bg-zinc-100"
          >
            <DotsVertical data-testid="menu" size={20} />
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
          <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1">
              {menuItems.map(([link, caption], index) => (
                <Menu.Item key={index}>
                  {({ active }) => {
                    const isBackup = link === AppLinks.Backup;
                    const className = twMerge(
                      'group text-base font-light flex w-full items-center rounded p-2 text-zinc-800 transition-all duration-150',
                      active && 'bg-zinc-200'
                    );
                    return (
                      <Link
                        to={link}
                        className={className}
                        target={isBackup ? '_blank' : undefined}
                        rel={isBackup ? 'noopener noreferrer' : undefined}
                      >
                        {caption}
                      </Link>
                    );
                  }}
                </Menu.Item>
              ))}
              {loggedIn && (
                <Menu.Item>
                  {({ active }) => {
                    const className = twMerge(
                      'group text-base font-light flex w-full items-center rounded p-2 text-zinc-800 transition-all duration-150',
                      active && 'bg-zinc-200'
                    );
                    return (
                      <Form action={AppLinks.Logout} method="post">
                        <button type="submit" className={className}>
                          Log Out
                        </button>
                      </Form>
                    );
                  }}
                </Menu.Item>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

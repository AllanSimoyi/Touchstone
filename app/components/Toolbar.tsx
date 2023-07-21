import { Link } from '@remix-run/react';

import { AppLinks } from '~/models/links';

import { AppTitle } from './AppTitle';
import { CenteredView } from './CenteredView';
import { DropDownMenu } from './DropDownMenu';

export interface ToolbarProps {
  currentUserName: string | undefined;
}

export function Toolbar(props: ToolbarProps) {
  const { currentUserName } = props;

  return (
    <header className="sticky top-0 flex w-full flex-col items-stretch border border-zinc-200 bg-white p-2 shadow-sm">
      <CenteredView>
        <div className="flex flex-row items-stretch justify-center">
          <div className="flex flex-col justify-center">
            <Link to={AppLinks.Home}>
              <AppTitle />
            </Link>
          </div>
          <div className="grow" />
          <div className="flex flex-row items-center justify-end gap-2">
            {currentUserName && (
              <span
                className="p-2 text-base font-light"
                title={currentUserName}
              >
                {currentUserName}
              </span>
            )}
            <DropDownMenu loggedIn={!!currentUserName} />
          </div>
        </div>
      </CenteredView>
    </header>
  );
}

import { Link, useNavigation } from '@remix-run/react';

import { AppLinks } from '~/models/links';

import { AppTitle } from './AppTitle';
import { CenteredView } from './CenteredView';
import { DropDownMenu } from './DropDownMenu';
import { ProgressBar } from './ProgressBar';
import { UnderLineOnHover } from './UnderLineOnHover';

export interface ToolbarProps {
  currentUserName: string | undefined;
  showProgressBar?: boolean;
}

export function Toolbar(props: ToolbarProps) {
  const { currentUserName, showProgressBar: initShowProgressBar } = props;

  const navigation = useNavigation();

  const showProgressBar = initShowProgressBar || navigation.state !== 'idle';

  return (
    <header className="sticky top-0 flex w-full flex-col items-stretch border border-zinc-200 bg-white shadow-sm">
      {showProgressBar && (
        <div className="flex flex-col items-stretch py-0">
          <ProgressBar />
        </div>
      )}
      <div className="flex flex-col items-stretch p-2">
        <CenteredView>
          <div className="flex flex-row items-stretch justify-center">
            <div className="flex flex-col justify-center">
              <Link to={AppLinks.Home}>
                <UnderLineOnHover>
                  <AppTitle className="transition-all duration-150 hover:text-zinc-800" />
                </UnderLineOnHover>
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
      </div>
    </header>
  );
}

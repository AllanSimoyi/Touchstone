import { Link, useNavigation } from '@remix-run/react';
import dayjs from 'dayjs';

import { AppLinks } from '~/models/links';

import { AppTitle } from './AppTitle';
import { CenteredView } from './CenteredView';
import { DropDownMenu } from './DropDownMenu';
import { NavDropDownMenu } from './NavDropDownMenu';
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
    <header className="sticky top-0 z-50 flex w-full flex-col items-stretch border border-zinc-200 bg-white shadow-sm">
      {showProgressBar && (
        <div className="flex flex-col items-stretch py-0">
          <ProgressBar />
        </div>
      )}
      <div className="flex flex-col items-stretch px-2 py-4">
        <CenteredView>
          <div className="flex flex-row items-center justify-center gap-10 whitespace-nowrap">
            <div className="flex flex-col justify-center">
              <Link to={AppLinks.Home}>
                <UnderLineOnHover>
                  <AppTitle className="transition-all duration-150 hover:text-zinc-800" />
                </UnderLineOnHover>
              </Link>
            </div>
            <div className="grow" />
            <NavDropDownMenu
              title="Support Jobs"
              items={[
                [AppLinks.SupportJobs, 'Record New Support Job'],
                [AppLinks.SupportJobs, 'View Support Jobs'],
              ]}
            />
            <NavDropDownMenu
              title="Customers"
              items={[
                [AppLinks.AddCustomer, 'Record New Customer'],
                [AppLinks.Customers, 'View Customers'],
              ]}
            />
            <NavDropDownMenu
              title="Users"
              items={[
                [AppLinks.AddUser, 'Record New User'],
                [AppLinks.Users, 'View Users'],
              ]}
            />
            <NavDropDownMenu
              title="Audit Trail"
              items={[
                [
                  `${AppLinks.AuditTrail}?minDate=${dayjs().startOf('day')}`,
                  "Today's Activity",
                ],
                [AppLinks.AuditTrail, 'View Timeline'],
              ]}
            />
            <NavDropDownMenu
              title="Migration"
              items={[
                [AppLinks.Import, 'Import From Excel'],
                [AppLinks.Backup, 'Import From Excel'],
              ]}
            />
            <DropDownMenu loggedIn={!!currentUserName} />
          </div>
        </CenteredView>
      </div>
    </header>
  );
}

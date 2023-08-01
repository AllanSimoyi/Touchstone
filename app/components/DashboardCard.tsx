import { AppLinks } from '~/models/links';

import { Card } from './Card';
import { PrimaryButtonLink } from './PrimaryButton';

interface CustomLink {
  to: string;
  caption: string;
}
interface Props {
  title: string;
  links: [CustomLink, CustomLink];
}
export function DashboardCard(props: Props) {
  const { title, links } = props;
  return (
    <Card className="flex flex-col items-stretch">
      <div className="flex flex-col items-center justify-center border-b border-zinc-200 p-4">
        <h2 className="text-lg">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        {links.map((link, index) => {
          const isBackup = link.to === AppLinks.Backup;
          return (
            <PrimaryButtonLink
              key={index}
              to={link.to}
              target={isBackup ? '_blank' : undefined}
              rel={isBackup ? 'noopener noreferrer' : undefined}
            >
              {link.caption}
            </PrimaryButtonLink>
          );
        })}
      </div>
    </Card>
  );
}

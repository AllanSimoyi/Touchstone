import { Card } from './Card';
import { SecondaryButtonLink } from './SecondaryButton';

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
      <div className="flex flex-col items-center justify-center border-b border-zinc-200 p-2">
        <h2 className="text-lg">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2">
        {links.map((link, index) => (
          <SecondaryButtonLink key={index} to={link.to}>
            {link.caption}
          </SecondaryButtonLink>
        ))}
      </div>
    </Card>
  );
}

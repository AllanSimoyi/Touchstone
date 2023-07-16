import { Link } from "@remix-run/react";
import { Card } from "./Card";

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
      <div className="flex flex-col justify-center items-center p-2">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="grid grid-cols-2 divide-x">
        {links.map((link, index) => (
          <Link key={index} to={link.to}>
            {link.caption}
          </Link>
        ))}
      </div>
    </Card>
  )
}
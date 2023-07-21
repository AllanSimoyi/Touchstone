import type {
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
} from '@remix-run/node';

import { cssBundleHref } from '@remix-run/css-bundle';
import { json } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';

import { getUser } from '~/session.server';
import stylesheet from '~/tailwind.css';

export const meta: V2_MetaFunction = () => [{ title: 'Touchstone' }];

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;600;700&display=swap',
  },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
];

export const loader = async ({ request }: LoaderArgs) => {
  return json({ user: await getUser(request) });
};

export default function App() {
  return (
    <html lang="en" className="h-full bg-zinc-100">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className="h-full"
        style={{ fontFamily: '"Poppins", sans-serif !important' }}
      >
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

import type { ActionArgs, LoaderArgs } from '@remix-run/node';

import { json, redirect } from '@remix-run/node';
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import { requireUserId } from '~/session.server';

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUserId(request);
  invariant(params.noteId, 'noteId not found');

  return json({});
};

export const action = async ({ params, request }: ActionArgs) => {
  await requireUserId(request);

  return redirect('/notes');
};

export default function NoteDetailsPage() {
  useLoaderData<typeof loader>();

  return (
    <div>
      <hr className="my-4" />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Note not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}

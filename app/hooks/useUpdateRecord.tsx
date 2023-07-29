import type { ZodTypeAny } from 'zod';

import { useFetcher } from '@remix-run/react';

import { useForm } from '~/components/ActionContextProvider';

import { useActionErrors } from './useActionErrors';

export function useUpdateRecord<T extends ZodTypeAny>(Schema: T) {
  const updateFetcher = useFetcher();
  const updateProps = useForm(updateFetcher.data, Schema);
  const updateErrors = useActionErrors(updateFetcher.data);
  const isUpdating = updateFetcher.state !== 'idle';

  return { updateFetcher, updateProps, updateErrors, isUpdating };
}

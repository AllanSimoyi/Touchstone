import type { ZodTypeAny, z } from 'zod';

import { useEffect } from 'react';

import { hasSuccess } from '~/models/core.validations';

export function useFieldClearOnSuccess<
  T extends ZodTypeAny,
  K extends string & keyof z.infer<T>
>(
  data: unknown,
  _: T,
  refMapping: [
    K,
    React.RefObject<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ][]
) {
  useEffect(() => {
    if (hasSuccess(data) && data.success) {
      refMapping.forEach(([, ref]) => {
        if (ref.current) {
          ref.current.value = '';
        }
      });
    }
  }, [refMapping, data]);
}

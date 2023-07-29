import type { ZodTypeAny, z } from 'zod';

import { useMemo } from 'react';

export function useFormData<
  T extends ZodTypeAny,
  K extends string & keyof z.infer<T>
>(formData: FormData | undefined, _: T, fields: K[]) {
  return useMemo(() => {
    if (!formData) {
      return undefined;
    }
    return fields.reduce((acc, field) => {
      return { ...acc, [field]: formData.get(field)?.toString() };
    }, {} as Record<K, string | undefined>);
  }, [fields, formData]);
}

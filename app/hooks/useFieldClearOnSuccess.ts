import { useEffect } from 'react';

import { hasSuccess } from '~/models/core.validations';

export function useFieldClearOnSuccess(
  data: unknown,
  refMapping: React.RefObject<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >[]
) {
  useEffect(() => {
    if (hasSuccess(data) && data.success) {
      refMapping.forEach((ref) => {
        if (ref.current) {
          ref.current.value = '';
        }
      });
    }
  }, [refMapping, data]);
}

import { useMemo } from 'react';

import { fieldErrorsToArr, hasFieldErrors, hasFormError } from '~/models/forms';

export function useActionErrors(actionData: unknown) {
  return useMemo(() => {
    const fieldErrors = hasFieldErrors(actionData)
      ? fieldErrorsToArr(actionData.fieldErrors)?.join(', ')
      : undefined;
    const formErrors = hasFormError(actionData)
      ? actionData.formError
      : undefined;
    return [fieldErrors, formErrors].filter(Boolean).join(', ');
  }, [actionData]);
}

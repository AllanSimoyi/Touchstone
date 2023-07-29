import type { FieldErrors, FormFields } from '../models/forms';
import type { ZodTypeAny, z } from 'zod';

import { useNavigation } from '@remix-run/react';
import { createContext, useCallback, useContext, useMemo } from 'react';

import { hasFieldErrors, hasFields, hasFormError } from '../models/forms';

interface ContextProps {
  formError?: string;
  fields?: FormFields;
  fieldErrors?: FieldErrors;
  isSubmitting?: boolean;
}

export const ActionContext = createContext<ContextProps>({
  formError: undefined,
  fields: {},
  fieldErrors: {},
  isSubmitting: false,
});

interface Props extends ContextProps {
  children: React.ReactNode;
}
export function ActionContextProvider(props: Props) {
  const { children, ...restOfProps } = props;
  return (
    <ActionContext.Provider value={restOfProps}>
      {children}
    </ActionContext.Provider>
  );
}

function useActionContext() {
  const context = useContext<ContextProps>(ActionContext);
  if (!context) {
    throw new Error(
      `useActionContext must be used within a ActionContextProvider`
    );
  }
  return context;
}

export function useField(name: string) {
  const { fields, fieldErrors } = useActionContext();
  return {
    value: fields?.[name],
    error: fieldErrors?.[name],
  };
}

export function useFormError() {
  const { formError } = useActionContext();
  return formError;
}

export function useIsSubmitting() {
  const { isSubmitting } = useActionContext();
  return isSubmitting;
}

export function useForm<T extends ZodTypeAny>(actionData: unknown, Schema: T) {
  const { state: navigationState } = useNavigation();

  type SchemaKeys = keyof z.infer<typeof Schema>;

  const getNameProp = useCallback((name: SchemaKeys) => {
    return { name };
  }, []);

  const fieldErrors = useMemo(() => {
    if (hasFieldErrors(actionData)) {
      return actionData.fieldErrors as FieldErrors<SchemaKeys>;
    }
  }, [actionData]);

  const formError = useMemo(() => {
    if (hasFormError(actionData)) {
      return actionData.formError;
    }
  }, [actionData]);

  const fields = useMemo(() => {
    if (hasFields(actionData)) {
      return actionData.fields as FormFields<SchemaKeys>;
    }
  }, [actionData]);

  const isProcessing = useMemo(
    () => navigationState !== 'idle',
    [navigationState]
  );

  return { getNameProp, fieldErrors, formError, fields, isProcessing };
}

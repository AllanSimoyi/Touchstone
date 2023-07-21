import type {
  CustomFieldErrors,
  CustomFormFields,
  FieldErrors,
  FormFields,
} from '../models/forms';

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

export function useForm<FieldNames extends string>(actionData: unknown) {
  const { state: navigationState } = useNavigation();

  const getNameProp = useCallback((name: FieldNames) => {
    return { name };
  }, []);

  const fieldErrors = useMemo(() => {
    if (hasFieldErrors(actionData)) {
      return actionData.fieldErrors as CustomFieldErrors<FieldNames>;
    }
  }, [actionData]);

  const formError = useMemo(() => {
    if (hasFormError(actionData)) {
      return actionData.formError;
    }
  }, [actionData]);

  const fields = useMemo(() => {
    if (hasFields(actionData)) {
      return actionData.fields as CustomFormFields<FieldNames>;
    }
  }, [actionData]);

  const isProcessing = useMemo(
    () => navigationState !== 'idle',
    [navigationState]
  );

  return { getNameProp, fieldErrors, formError, fields, isProcessing };
}

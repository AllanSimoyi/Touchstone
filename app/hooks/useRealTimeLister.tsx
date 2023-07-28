import type { KeyboardEvent } from 'react';
import type { ZodTypeAny, z } from 'zod';

import { useCallback, useEffect, useState } from 'react';

import { useField } from '~/components/ActionContextProvider';
import {
  INVALID_VALUES_FROM_SERVER,
  stringifyZodError,
} from '~/models/core.validations';
import { getErrorMessage } from '~/models/errors';

interface Props<SchemaType extends ZodTypeAny> {
  name: string;
  Schema: SchemaType;
  isSameItem: (
    first: z.infer<SchemaType>,
    second: z.infer<SchemaType>
  ) => boolean;
  clearInput: () => void;
}
export function useRealTimeLister<SchemaType extends ZodTypeAny>(
  props: Props<SchemaType>
) {
  const { name, Schema, isSameItem, clearInput } = props;

  const { value, error: errorsFromServer } = useField(name);

  const [items, setItems] = useState<z.infer<SchemaType>[]>([]);
  const [error, setErrors] = useState(errorsFromServer?.join(', ') || '');

  useEffect(() => {
    try {
      if (typeof value !== 'string') {
        return;
      }
      const result = Schema.array().safeParse(JSON.parse(value));
      if (!result.success) {
        throw new Error(result.error.message);
      }
      setItems(result.data);
    } catch (error) {
      console.error(getErrorMessage(error));
      setErrors(INVALID_VALUES_FROM_SERVER);
    }
  }, [value, Schema]);

  const removeItem = useCallback(
    (item: z.infer<SchemaType>) => {
      setItems((prevState) => prevState.filter((el) => !isSameItem(el, item)));
    },
    [isSameItem]
  );

  const addItem = useCallback(
    (input: unknown) => {
      const result = Schema.safeParse(input);
      if (!result.success) {
        return window.alert(stringifyZodError(result.error));
      }
      const newItem = result.data;
      setItems((prevState) => {
        if (prevState.some((el) => isSameItem(el, newItem))) {
          return prevState;
        }
        return [...prevState, newItem];
      });
      clearInput();
    },
    [Schema, clearInput, isSameItem]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>, input: unknown) => {
      if (event.defaultPrevented) {
        return;
      }
      if (event.key && event.key === 'Enter') {
        addItem(input);
        event.preventDefault();
      }
    },
    [addItem]
  );

  return { items, error, addItem, removeItem, onKeyDown };
}

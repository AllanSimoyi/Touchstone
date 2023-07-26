import type { KeyboardEvent } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, X } from 'tabler-icons-react';
import { z } from 'zod';

import { stringifyZodError } from '~/models/core.validations';
import { getErrorMessage } from '~/models/errors';

import { useField } from './ActionContextProvider';
import { Chip } from './Chip';
import { GhostButton } from './GhostButton';
import { InlineAlert } from './InlineAlert';
import { SecondaryButton } from './SecondaryButton';
import { TextField } from './TextField';

const Schema = z.object({
  name: z
    .string()
    .min(1, "Please enter the operator's name")
    .max(200, "Please use less than 200 characters for the operator's name"),
  email: z
    .string({ required_error: "Please enter the operators' email" })
    .email('Please enter a valid email for the operator'),
});
type Operator = z.infer<typeof Schema>;

interface Props {
  name: string;
}
export function AddEditOperators(props: Props) {
  const { name } = props;

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const { value, error: errors } = useField(name);

  const [operators, setOperators] = useState<Operator[]>([]);
  const [error, setErrors] = useState(errors?.join(', ') || '');

  useEffect(() => {
    if (typeof value !== 'string') {
      return;
    }
    try {
      const result = Schema.array().safeParse(JSON.parse(value));
      if (!result.success) {
        throw new Error(result.error.message);
      }
      setOperators(result.data);
    } catch (error) {
      console.error(getErrorMessage(error));
      setErrors(
        'Received invalid inputs from server, please contact the developer'
      );
    }
  }, [value]);

  const removeOperator = useCallback((operatorName: string) => {
    setOperators((prevState) =>
      prevState.filter((el) => el.name !== operatorName)
    );
  }, []);

  const addOperator = useCallback(() => {
    if (!nameRef.current || !emailRef.current) {
      return;
    }
    const result = Schema.safeParse({
      name: nameRef.current.value,
      email: emailRef.current.value,
    });
    if (!result.success) {
      return window.alert(stringifyZodError(result.error));
    }
    const newOperator = result.data;
    setOperators((prevState) => {
      if (prevState.some((el) => el.name === newOperator.name)) {
        return prevState;
      }
      return [...prevState, newOperator];
    });
    nameRef.current.value = '';
    emailRef.current.value = '';
    nameRef.current.focus();
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.defaultPrevented) {
        return;
      }
      if (event.key && event.key === 'Enter') {
        addOperator();
        event.preventDefault();
      }
    },
    [addOperator]
  );

  return (
    <>
      <input type="hidden" name={name} value={JSON.stringify(operators)} />
      <div className="flex flex-col items-stretch gap-2 p-2">
        {operators.map((operator) => (
          <Chip key={operator.name} className="gap-2">
            <span className="text-sm font-light text-zinc-500">
              {operator.name} - {operator.email}
            </span>
            <div className="grow" />
            <GhostButton
              onClick={() => removeOperator(operator.name)}
              className="p-0"
              title="Remove operator from list"
            >
              <X className="text-red-600" />
            </GhostButton>
          </Chip>
        ))}
        <div className="flex flex-row items-stretch gap-2">
          <div className="flex grow flex-col items-stretch">
            <TextField
              customRef={nameRef}
              name="operatorName"
              placeholder="Operator's name"
              onKeyDown={onKeyDown}
            />
          </div>
          <div className="flex grow flex-col items-stretch">
            <TextField
              type="email"
              customRef={emailRef}
              name="operatorEmail"
              placeholder="Operator's email"
              onKeyDown={onKeyDown}
            />
          </div>
          <SecondaryButton onClick={addOperator}>
            <Plus className="text-zinc-600" />
          </SecondaryButton>
        </div>
        {!!error && <InlineAlert>{error}</InlineAlert>}
      </div>
    </>
  );
}

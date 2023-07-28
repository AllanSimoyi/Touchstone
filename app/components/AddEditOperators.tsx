import type { KeyboardEvent } from 'react';

import { useCallback, useRef } from 'react';
import { z } from 'zod';

import { useLister } from '~/hooks/useLister';

import { AddEditListItems } from './AddEditListItems';
import { TextField } from './TextField';

const Schema = z.object({
  name: z
    .string({
      required_error: "Please enter the operator's name",
      invalid_type_error: "Enter valid input for the operator's name",
    })
    .min(1, "Please enter the operator's name")
    .max(200, "Please use less than 200 characters for the operator's name"),
  email: z
    .string({
      required_error: "Please enter the operators' email",
      invalid_type_error: "Enter valid input for the operator's email",
    })
    .email('Please enter a valid email for the operator'),
});

interface Props {
  name: string;
}
export function AddEditOperators(props: Props) {
  const { name } = props;

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const { addItem, onKeyDown, ...lister } = useLister({
    name,
    Schema,
    isSameItem: (first, second) => first.name === second.name,
    clearInput: () => {
      if (nameRef.current && emailRef.current) {
        nameRef.current.value = '';
        emailRef.current.value = '';
        nameRef.current.focus();
      }
    },
  });

  const addOperator = useCallback(() => {
    if (!nameRef.current || !emailRef.current) {
      return;
    }
    addItem({
      name: nameRef.current.value,
      email: emailRef.current.value,
    });
  }, [addItem]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!nameRef.current || !emailRef.current) {
        return;
      }
      onKeyDown(event, {
        name: nameRef.current.value,
        email: emailRef.current.value,
      });
    },
    [onKeyDown]
  );

  return (
    <AddEditListItems
      {...lister}
      name={name}
      getDisplayedText={(item) => `${item.name} - ${item.email}`}
      addItem={addOperator}
      InputControls={
        <>
          <div className="flex grow flex-col items-stretch">
            <TextField
              customRef={nameRef}
              name="operatorName"
              placeholder="Operator's name"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex grow flex-col items-stretch">
            <TextField
              type="email"
              customRef={emailRef}
              name="operatorEmail"
              placeholder="Operator's email"
              onKeyDown={handleKeyDown}
            />
          </div>
        </>
      }
    />
  );
}

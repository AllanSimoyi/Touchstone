import type { KeyboardEvent } from 'react';

import { useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';

import { useLister } from '~/hooks/useLister';

import { AddEditListItems } from './AddEditListItems';
import { TextField } from './TextField';

const Schema = z
  .string({
    required_error: "Please enter the database's name",
    invalid_type_error: "Please provide valid input for the database's name",
  })
  .min(1, "Please enter the database's name first")
  .max(200, "Please use less than 200 characters for the database's name");

interface Props {
  name: string;
  clearInput?: boolean;
}
export function AddEditDatabases(props: Props) {
  const { name, clearInput } = props;
  const newDatabaseRef = useRef<HTMLInputElement>(null);

  const { addItem, onKeyDown, clear, ...lister } = useLister({
    name,
    Schema,
    isSameItem: (first, second) => first === second,
    clearInput: () => {
      if (newDatabaseRef.current) {
        newDatabaseRef.current.value = '';
      }
    },
  });

  useEffect(() => {
    if (clearInput) {
      clear();
    }
  }, [clearInput, clear]);

  const addDatabase = useCallback(() => {
    if (newDatabaseRef.current) {
      addItem(newDatabaseRef.current.value);
    }
  }, [addItem]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (newDatabaseRef.current) {
        onKeyDown(event, newDatabaseRef.current.value);
      }
    },
    [onKeyDown]
  );

  return (
    <AddEditListItems
      {...lister}
      name={name}
      getDisplayedText={(item) => item}
      addItem={addDatabase}
      InputControls={
        <div className="flex grow flex-col items-stretch">
          <TextField
            customRef={newDatabaseRef}
            name="newDatabase"
            placeholder="Enter new database"
            onKeyDown={handleKeyDown}
          />
        </div>
      }
    />
  );
}

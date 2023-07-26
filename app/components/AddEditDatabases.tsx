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

const Schema = z
  .string()
  .min(1, 'Please enter the database first')
  .max(200, 'Please use less than 200 characters for the database');

interface Props {
  name: string;
}
export function AddEditDatabases(props: Props) {
  const { name } = props;
  const newDatabaseRef = useRef<HTMLInputElement>(null);

  const { value, error: errorsFromServer } = useField(name);

  const [databases, setDatabases] = useState<string[]>([]);
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
      setDatabases(result.data);
    } catch (error) {
      console.error(getErrorMessage(error));
      setErrors(
        'Received invalid values from server, please contact the developer'
      );
    }
  }, [value]);

  const removeDatabase = useCallback((database: string) => {
    setDatabases((prevState) => prevState.filter((el) => el !== database));
  }, []);

  const addDatabase = useCallback(() => {
    if (!newDatabaseRef.current) {
      return;
    }
    const result = Schema.safeParse(newDatabaseRef.current.value);
    if (!result.success) {
      return window.alert(stringifyZodError(result.error));
    }
    const newDatabase = result.data;
    setDatabases((prevState) => {
      if (prevState.some((el) => el === newDatabase)) {
        return prevState;
      }
      return [...prevState, newDatabase];
    });
    newDatabaseRef.current.value = '';
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.defaultPrevented) {
        return;
      }
      if (event.key && event.key === 'Enter') {
        addDatabase();
        event.preventDefault();
      }
    },
    [addDatabase]
  );

  return (
    <>
      <input type="hidden" name={name} value={JSON.stringify(databases)} />
      <div className="flex flex-col items-stretch gap-2 p-2">
        {databases.map((database, index) => (
          <Chip key={index} className="gap-2">
            <span className="text-sm font-light text-zinc-500">{database}</span>
            <div className="grow" />
            <GhostButton
              onClick={() => removeDatabase(database)}
              className="p-0"
              title="Remove database from list"
            >
              <X className="text-red-600" />
            </GhostButton>
          </Chip>
        ))}
        <div className="flex flex-row items-stretch gap-2">
          <div className="flex grow flex-col items-stretch">
            <TextField
              customRef={newDatabaseRef}
              name="newDatabase"
              placeholder="Enter new database"
              onKeyDown={onKeyDown}
            />
          </div>
          <SecondaryButton onClick={addDatabase}>
            <Plus className="text-zinc-600" />
          </SecondaryButton>
        </div>
        {!!error && <InlineAlert>{error}</InlineAlert>}
      </div>
    </>
  );
}

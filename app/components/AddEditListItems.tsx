import { Plus, X } from 'tabler-icons-react';

import { Chip } from './Chip';
import { GhostButton } from './GhostButton';
import { InlineAlert } from './InlineAlert';
import { SecondaryButton } from './SecondaryButton';

interface Props<T> {
  name: string;
  items: T[];
  getDisplayedText: (item: T) => string;
  addItem: () => void;
  removeItem: (item: T) => void;
  error: string | undefined;
  InputControls: React.ReactNode;
}
export function AddEditListItems<T>(props: Props<T>) {
  const {
    name,
    items,
    getDisplayedText,
    removeItem,
    InputControls,
    addItem,
    error,
  } = props;

  return (
    <>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="flex flex-col items-stretch gap-2 p-2">
        {items.map((item, index) => (
          <Chip key={index} className="gap-2">
            <span className="text-base font-light text-zinc-500">
              {getDisplayedText(item)}
            </span>
            <div className="grow" />
            <GhostButton
              onClick={() => removeItem(item)}
              className="p-0"
              title="Remove item from list"
            >
              <X className="text-red-600" />
            </GhostButton>
          </Chip>
        ))}
        <div className="flex flex-row items-stretch gap-2">
          {InputControls}
          <SecondaryButton onClick={addItem} isIcon>
            <Plus className="text-zinc-600" size={20} />
          </SecondaryButton>
        </div>
        {!!error && <InlineAlert>{error}</InlineAlert>}
      </div>
    </>
  );
}

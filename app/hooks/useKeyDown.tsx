import type { KeyboardEvent } from 'react';

import { useCallback } from 'react';

export function useKeyDown() {
  const onEnterPressed = useCallback(
    (
      event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
      logic: () => any
    ) => {
      if (event.defaultPrevented) {
        return;
      }
      if (event.key && event.key === 'Enter') {
        event.preventDefault();
        logic();
      }
    },
    []
  );
  return { onEnterPressed };
}

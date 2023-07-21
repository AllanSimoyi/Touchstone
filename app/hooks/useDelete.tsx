import { useCallback, useState } from 'react';

interface Props {
  handleDelete: () => void;
}

export function useDelete(props: Props) {
  const { handleDelete } = props;

  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const onConfirmed = useCallback(() => {
    closeModal();
    handleDelete();
  }, [closeModal, handleDelete]);

  return {
    isOpen,
    askForConfirmation: openModal,
    closeModal,
    onConfirmed,
  };
}

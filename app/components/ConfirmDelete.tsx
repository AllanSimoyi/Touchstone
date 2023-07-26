import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

import { DangerButton } from './DangerButton';
import { SecondaryButton } from './SecondaryButton';

interface Props {
  isOpen: boolean;
  onConfirmed: () => void;
  closeModal: () => void;
}

export function ConfirmDelete(props: Props) {
  const { isOpen, onConfirmed, closeModal } = props;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10 shadow-xl" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="flex w-full max-w-md transform flex-col items-stretch overflow-hidden rounded-md bg-white text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="p-4 text-lg leading-6 text-gray-900"
                >
                  Are you sure?
                </Dialog.Title>
                <div className="flex flex-col items-stretch px-4 py-4">
                  <span className="text-sm font-light text-gray-600">
                    Please confirm you wish to delete this record.
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-t-zinc-100 p-4">
                  <DangerButton
                    className="order-2"
                    type="button"
                    onClick={onConfirmed}
                  >
                    Delete
                  </DangerButton>
                  <SecondaryButton className="order-1" onClick={closeModal}>
                    Cancel
                  </SecondaryButton>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

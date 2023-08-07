import { toast } from 'react-toastify';

export const TOAST_DURATION = 1500;

export function showToast(variant: 'success' | 'error', message: string) {
  const toastFunction = variant === 'success' ? toast.success : toast.error;
  return toastFunction(message, {
    position: 'bottom-right',
    autoClose: TOAST_DURATION,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
  });
}

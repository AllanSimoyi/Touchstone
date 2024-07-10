import { useNavigate } from '@remix-run/react';
import { ChevronLeft } from 'tabler-icons-react';
import { twMerge } from 'tailwind-merge';

export function Back() {
  const navigate = useNavigate();

  function handleClick() {
    navigate(-1);
  }

  return (
    <button
      onClick={handleClick}
      className={twMerge(
        'mb-4 flex flex-row items-center gap-4 rounded-full border border-stone-400 px-4 py-2',
        'text-2xl font-semibold text-zinc-400 transition-all duration-150 hover:text-zinc-800'
      )}
    >
      <ChevronLeft />
      <span>Back</span>
    </button>
  );
}

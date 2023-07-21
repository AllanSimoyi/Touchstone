import type { ComponentProps } from 'react';

import { twMerge } from 'tailwind-merge';

export function SearchBox(props: ComponentProps<'input'>) {
  const { className, disabled, ...restOfProps } = props;
  return (
    <div
      className={twMerge(
        'flex flex-row items-center focus-within:ring-1 focus-within:ring-zinc-400',
        'rounded-md border border-zinc-200 bg-zinc-50 shadow-inner outline-none',
        'transition-all duration-200'
      )}
    >
      <div className="pointer-events-none flex items-center pl-2">
        <svg
          aria-hidden="true"
          className="h-5 w-5 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <input
        type="text"
        disabled={disabled}
        className={twMerge(
          'w-full bg-transparent p-2 text-sm font-light outline-none transition-all duration-300',
          disabled &&
            'cursor-not-allowed bg-zinc-200 text-zinc-600 shadow-none',
          className
        )}
        {...restOfProps}
      />
    </div>
  );
}

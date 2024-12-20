import type { ComponentProps } from 'react';

import { twMerge } from 'tailwind-merge';

type Props = ComponentProps<'input'> & {
  noIcon?: boolean;
};
export function SearchBox(props: Props) {
  const { className, disabled, noIcon, ...restOfProps } = props;
  return (
    <div
      className={twMerge(
        'flex flex-row items-center focus-within:ring-1 focus-within:ring-zinc-400',
        'rounded-md border border-zinc-200 shadow-inner outline-none',
        'transition-all duration-200'
      )}
    >
      {!noIcon && (
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
      )}
      <input
        type="text"
        disabled={disabled}
        className={twMerge(
          'w-full bg-transparent p-2 text-base font-light outline-none transition-all duration-150',
          disabled &&
            'cursor-not-allowed bg-zinc-200 text-zinc-600 shadow-none',
          className
        )}
        {...restOfProps}
      />
    </div>
  );
}

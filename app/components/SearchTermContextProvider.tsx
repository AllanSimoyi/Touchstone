import { createContext, useContext } from 'react';

interface ContextProps {
  searchTerms: string;
}

export const SearchTermContext = createContext<ContextProps>({
  searchTerms: '',
});

interface Props extends ContextProps {
  children: React.ReactNode;
}
export function SearchTermContextProvider(props: Props) {
  const { children, ...restOfProps } = props;
  return (
    <SearchTermContext.Provider value={restOfProps}>
      {children}
    </SearchTermContext.Provider>
  );
}

function useSearchTermContext() {
  const context = useContext<ContextProps>(SearchTermContext);
  if (!context) {
    return undefined;
  }
  return context;
}

export function useSearchTerms() {
  const context = useSearchTermContext();
  return context?.searchTerms || '';
}

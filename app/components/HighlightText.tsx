import Highlighter from 'react-highlight-words';

import { useSearchTerms } from './SearchTermContextProvider';

interface Props {
  children: string;
  className?: string;
}

export function HighlightText(props: Props) {
  const { children, className } = props;

  const searchTerms = useSearchTerms();

  return (
    <>
      {!searchTerms && <span className={className}>{children}</span>}
      {searchTerms && (
        <span className={className}>
          <Highlighter
            highlightClassName=""
            searchWords={[searchTerms]}
            autoEscape
            textToHighlight={children}
          />
        </span>
      )}
    </>
  );
}

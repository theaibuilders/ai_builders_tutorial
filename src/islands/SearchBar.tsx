import { useState, useEffect } from 'preact/hooks';
import type { JSX } from 'preact';

interface SearchResult {
  title: string;
  path: string;
  type: 'notebook' | 'markdown';
  description?: string;
  section: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Search function with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        // This would be replaced with actual search API call
        const mockResults: SearchResult[] = [
          {
            title: 'Getting Started with LangChain',
            path: 'langchain/01-introduction.md',
            type: 'markdown' as const,
            description: 'Introduction to LangChain framework',
            section: 'LangChain'
          },
          {
            title: 'LangChain Basics',
            path: 'langchain/02-langchain-basics.ipynb',
            type: 'notebook' as const,
            description: 'Basic concepts and examples',
            section: 'LangChain'
          }
        ].filter(result => 
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description?.toLowerCase().includes(query.toLowerCase())
        );

        setResults(mockResults);
        setIsOpen(mockResults.length > 0);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    window.location.href = `/tutorials/${result.path}`;
  };

  const handleKeyDown = (e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-dark-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown}
          placeholder="Search tutorials..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-dark-text placeholder-dark-secondary"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-dark-bg border border-dark-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 text-left hover:bg-dark-hover transition-colors border-b border-dark-border last:border-b-0"
            >
              <div className="flex items-start gap-3">
                {/* File Type Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-dark-secondary" fill="currentColor" viewBox="0 0 20 20">
                    {result.type === 'notebook' ? (
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2a1 1 0 000 2h8a1 1 0 100-2H6zm0 3a1 1 0 000 2h8a1 1 0 100-2H6zm0 3a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                    ) : (
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2v6l2-2 2 2V7H6z"/>
                    )}
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-dark-text truncate">
                      {result.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      result.type === 'notebook' 
                        ? 'bg-orange-500/20 text-orange-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {result.type === 'notebook' ? 'ipynb' : 'md'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-dark-secondary mb-1">
                    {result.section}
                  </div>
                  
                  {result.description && (
                    <p className="text-xs text-dark-secondary line-clamp-2">
                      {result.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim() && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-2 bg-dark-bg border border-dark-border rounded-lg shadow-lg p-4">
          <div className="text-center text-dark-secondary">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.674-2.583m0 0A7.962 7.962 0 014 9c0-1.933.685-3.708 1.826-5.074C7.178 2.564 9.5 2 12 2s4.822.564 6.174 1.926C19.315 5.292 20 7.067 20 9c0 1.933-.685 3.708-1.826 5.074M6.326 6.417m0 0A7.962 7.962 0 0112 3" />
            </svg>
            <p className="text-sm">No tutorials found for "{query}"</p>
          </div>
        </div>
      )}
    </div>
  );
}

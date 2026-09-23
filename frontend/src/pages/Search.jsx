import { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, SearchX, X } from 'lucide-react';
import PageTransition from '../components/app/PageTransition.jsx';
import SearchBar from '../components/app/SearchBar.jsx';
import SearchResult from '../components/search/SearchResult.jsx';
import Select from '../components/ui/Select.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { SearchResultSkeleton } from '../components/ui/Skeleton.jsx';
import { clearSearchHistory, getSearchHistory, semanticSearch } from '../api/searchApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatRelative } from '../utils/format.js';

const examples = [
  'Explain 2NF with an example',
  'How does a circular queue wrap around?',
  'Where is SVD used for compression?',
];

export default function Search() {
  const { collections } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [submitted, setSubmitted] = useState(searchParams.get('q') ?? '');
  const [collectionId, setCollectionId] = useState('');
  const [state, setState] = useState({ results: null, loading: false, error: null });

  const history = useAsync(() => getSearchHistory(), []);

  const runSearch = useCallback(
    async (value, scopeId) => {
      const q = value.trim();
      if (!q) return;
      setSubmitted(q);
      setSearchParams({ q }, { replace: true });
      setState({ results: null, loading: true, error: null });
      try {
        const data = await semanticSearch({ query: q, collectionId: scopeId || undefined });
        setState({ results: data.results, loading: false, error: null });
        history.run().catch(() => {});
      } catch (error) {
        setState({ results: null, loading: false, error });
      }
    },
    [setSearchParams, history]
  );

  useEffect(() => {
    const initial = searchParams.get('q');
    if (initial) runSearch(initial, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = state.results;
  const recent = history.data?.results ?? [];

  return (
    <PageTransition className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 lg:py-12">
      <header className="mb-6">
        <h1 className="text-title font-semibold tracking-[-0.022em] text-ink">Search</h1>
        <p className="mt-1.5 text-lg text-muted">
          Describe what you remember. Matching is by meaning, not exact wording.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBar
          size="lg"
          autoFocus
          value={query}
          onChange={setQuery}
          onSubmit={(value) => runSearch(value, collectionId)}
          placeholder="Search your knowledge…"
          className="min-w-[260px] flex-1"
        />
        <Select
          label="Search within"
          value={collectionId}
          onChange={(value) => {
            setCollectionId(value);
            if (submitted) runSearch(submitted, value);
          }}
          className="w-[170px]"
          options={[
            { value: '', label: 'All collections' },
            ...collections.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
      </div>

      {!results && !state.loading && !state.error && (
        <div className="mt-9 grid gap-9 sm:grid-cols-[minmax(0,1fr)_200px]">
          <section>
            <h2 className="mb-2.5 text-meta font-medium text-muted">Try asking</h2>
            <ul className="space-y-1.5">
              {examples.map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(example);
                      runSearch(example, collectionId);
                    }}
                    className="-mx-2 w-full rounded-md px-2 py-2 text-left text-base text-ink-soft transition-colors duration-150 hover:bg-raised hover:text-ink"
                  >
                    {example}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {recent.length > 0 && (
            <section>
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-meta font-medium text-muted">Recent</h2>
                <button
                  type="button"
                  aria-label="Clear search history"
                  onClick={async () => {
                    await clearSearchHistory();
                    history.run();
                    toast.info('Search history cleared');
                  }}
                  className="rounded p-1 text-faint transition-colors hover:bg-sunken hover:text-ink"
                >
                  <X size={12} strokeWidth={2} aria-hidden />
                </button>
              </div>
              <ul className="space-y-0.5">
                {recent.slice(0, 6).map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(item.query);
                        runSearch(item.query, collectionId);
                      }}
                      className="group -mx-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-150 hover:bg-raised"
                    >
                      <Clock size={12} strokeWidth={1.9} aria-hidden className="shrink-0 text-faint" />
                      <span className="min-w-0 flex-1 truncate text-meta text-ink-soft">{item.query}</span>
                      <span className="shrink-0 text-2xs text-faint">{formatRelative(item.at)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {state.loading && (
        <div className="mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SearchResultSkeleton key={i} />
          ))}
        </div>
      )}

      {state.error && (
        <div className="mt-8 rounded-lg border border-line bg-surface">
          <ErrorState
            title="Search failed"
            error={state.error}
            onRetry={() => runSearch(submitted, collectionId)}
            compact
          />
        </div>
      )}

      {results && !state.loading && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mt-8"
        >
          <p className="mb-1 text-meta text-faint">
            {results.length} {results.length === 1 ? 'passage' : 'passages'} for “{submitted}”
          </p>

          {results.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line bg-surface">
              <EmptyState
                icon={SearchX}
                title="No results found"
                description="Try a different question, or search across another collection."
                compact
              />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {results.map((result, index) => (
                <SearchResult key={result.id} result={result} query={submitted} index={index} />
              ))}
            </div>
          )}
        </motion.section>
      )}
    </PageTransition>
  );
}

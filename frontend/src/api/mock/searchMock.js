import { delay } from './mockClient.js';
import { searchResults, searchHistory } from './data.js';

let history = structuredClone(searchHistory);

export async function search({ query, collectionId }) {
  await delay(620);
  const q = (query ?? '').toLowerCase().trim();
  if (!q) return { results: [], count: 0 };

  const terms = q.split(/\s+/).filter((t) => t.length > 2);
  const scored = structuredClone(searchResults)
    .map((result) => {
      const haystack = `${result.documentName} ${result.excerpt} ${result.tags.join(' ')}`.toLowerCase();
      // Vector similarity carries the ranking; lexical hits only nudge it.
      const hits = terms.filter((t) => haystack.includes(t)).length;
      return { ...result, score: Math.min(0.98, result.score + hits * 0.03) };
    })
    .filter((result) => !collectionId || result.collectionName)
    .sort((a, b) => b.score - a.score);

  history = [
    { id: `s_${Date.now()}`, query, at: new Date().toISOString(), resultCount: scored.length },
    ...history.filter((h) => h.query !== query),
  ].slice(0, 12);

  return { results: scored, count: scored.length, query };
}

export async function listHistory() {
  await delay(200);
  return { results: structuredClone(history) };
}

export async function clearHistory() {
  await delay(200);
  history = [];
  return { results: [] };
}

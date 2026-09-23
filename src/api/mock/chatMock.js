import { delay, fail } from './mockClient.js';
import { chats, documentPages, documents } from './data.js';

let store = structuredClone(chats);

const sourceFor = (documentId, page) => {
  const doc = documents.find((d) => d.id === documentId);
  return {
    documentId,
    documentName: doc?.name ?? 'Document',
    documentType: doc?.type ?? 'pdf',
    page,
    excerpt: documentPages[documentId]?.[page] ?? '',
  };
};

export async function listChats() {
  await delay(240);
  return { results: store.map(({ messages, ...rest }) => ({ ...rest, messageCount: messages.length })) };
}

export async function retrieveChat(id) {
  await delay(260);
  const chat = store.find((c) => c.id === id);
  if (!chat) throw fail('That conversation no longer exists.', 404);
  return structuredClone(chat);
}

export async function createChat(scope = { type: 'all' }) {
  await delay(200);
  const chat = { id: `ch_${Date.now()}`, title: 'New conversation', updatedAt: new Date().toISOString(), scope, messages: [] };
  store = [chat, ...store];
  return structuredClone(chat);
}

export async function renameChat(id, title) {
  await delay(200);
  store = store.map((c) => (c.id === id ? { ...c, title } : c));
  return store.find((c) => c.id === id);
}

export async function deleteChat(id) {
  await delay(220);
  store = store.filter((c) => c.id !== id);
  return { id };
}

export async function ask({ question }) {
  await delay(1400);
  const q = question.toLowerCase();

  if (q.includes('2nf') || q.includes('normal')) {
    return {
      answer:
        'Second normal form removes partial dependency: once a relation is in 1NF, every non-prime attribute has to depend on the whole primary key, not just part of it. Only composite keys can break this rule.\n\nYour notes use STUDENT_COURSE(student_id, course_id, course_name, grade). The key is (student_id, course_id) but course_name is fixed by course_id alone, so the relation is decomposed into COURSE(course_id, course_name) and ENROLMENT(student_id, course_id, grade).',
      sources: [sourceFor('d_1', 12), sourceFor('d_1', 13), sourceFor('d_1', 11)],
    };
  }
  if (q.includes('queue')) {
    return {
      answer:
        'A circular queue treats the underlying array as a ring: the front and rear indices wrap with a modulo of the capacity, so space freed at the front is reused instead of being wasted.\n\nThe usual convention leaves one slot empty so that a full queue and an empty queue can be told apart — full is (rear + 1) % capacity === front, empty is rear === front.',
      sources: [sourceFor('d_3', 4)],
    };
  }
  if (q.includes('svd') || q.includes('compression')) {
    return {
      answer:
        'SVD factors an image matrix into UΣVᵀ. Keeping only the k largest singular values gives the best rank-k approximation under the Frobenius norm, which is why the reconstruction degrades gracefully as k falls.\n\nStorage drops from mn values to k(m + n + 1), so the compression ratio is a direct function of how quickly the singular values decay.',
      sources: [sourceFor('d_5', 7)],
    };
  }
  return {
    answer:
      'I could not find a confident answer for that in your library yet. The closest material is in your DBMS and Mathematics collections — try narrowing the question, or upload the source you are thinking of and ask again once it finishes indexing.',
    sources: [],
  };
}

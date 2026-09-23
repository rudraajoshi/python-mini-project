/**
 * Mock fixtures. Everything here is replaced by real API responses once the
 * Django backend is connected — nothing outside src/api/mock imports this file.
 */

const now = Date.now();
const hoursAgo = (h) => new Date(now - h * 3_600_000).toISOString();
const daysAgo = (d) => new Date(now - d * 86_400_000).toISOString();

export const user = {
  id: 'u_1',
  name: 'Rudra Mehta',
  email: 'rudra@example.com',
  joinedAt: daysAgo(214),
};

export const collections = [
  {
    id: 'c_dbms',
    name: 'DBMS',
    description: 'Relational design, normalization, indexing and transactions.',
    documentCount: 4,
    accent: '#4F6DF5',
    updatedAt: hoursAgo(3),
  },
  {
    id: 'c_maths',
    name: 'Mathematics',
    description: 'Linear algebra and probability coursework.',
    documentCount: 3,
    accent: '#177245',
    updatedAt: daysAgo(2),
  },
  {
    id: 'c_dsa',
    name: 'DSA',
    description: 'Data structures, complexity analysis and interview notes.',
    documentCount: 2,
    accent: '#9A6700',
    updatedAt: daysAgo(4),
  },
  {
    id: 'c_os',
    name: 'Operating Systems',
    description: 'Scheduling, memory management, concurrency.',
    documentCount: 1,
    accent: '#7C3AED',
    updatedAt: daysAgo(9),
  },
  {
    id: 'c_projects',
    name: 'Projects',
    description: 'Specs and research for personal builds.',
    documentCount: 1,
    accent: '#B42318',
    updatedAt: daysAgo(15),
  },
];

export const documents = [
  {
    id: 'd_1',
    name: 'DBMS Normalization.pdf',
    type: 'pdf',
    size: 2_418_112,
    pages: 38,
    collectionId: 'c_dbms',
    tags: ['normalization', 'unit 3'],
    status: 'ready',
    excerpt:
      'Functional dependencies, the normal forms from 1NF through BCNF, and worked decomposition examples from the Unit 3 lectures.',
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(3),
    openedAt: hoursAgo(3),
    lastPage: 12,
    bookmarked: true,
  },
  {
    id: 'd_2',
    name: 'DBMS Unit 1.pdf',
    type: 'pdf',
    size: 1_884_160,
    pages: 24,
    collectionId: 'c_dbms',
    tags: ['fundamentals'],
    status: 'ready',
    excerpt:
      'Data models, three-schema architecture, keys and the relational algebra primitives covered in the first unit.',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(12),
    openedAt: daysAgo(1),
    lastPage: 24,
    bookmarked: false,
  },
  {
    id: 'd_3',
    name: 'DSA Notes.md',
    type: 'md',
    size: 48_320,
    pages: 9,
    collectionId: 'c_dsa',
    tags: ['queues', 'trees', 'revision'],
    status: 'ready',
    excerpt:
      'Hand-written revision notes: circular queues, heap operations, and amortised analysis of dynamic arrays.',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(2),
    openedAt: hoursAgo(20),
    lastPage: 4,
    bookmarked: true,
  },
  {
    id: 'd_4',
    name: 'Probability Unit 2.pdf',
    type: 'pdf',
    size: 3_201_024,
    pages: 46,
    collectionId: 'c_maths',
    tags: ['probability', 'unit 2'],
    status: 'indexing',
    progress: 72,
    excerpt:
      'Random variables, expectation and variance, plus the standard distributions with solved tutorial problems.',
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
    openedAt: null,
    lastPage: 1,
    bookmarked: false,
  },
  {
    id: 'd_5',
    name: 'SVD Image Compression.pdf',
    type: 'pdf',
    size: 1_204_224,
    pages: 18,
    collectionId: 'c_maths',
    tags: ['linear algebra', 'svd'],
    status: 'ready',
    excerpt:
      'Singular value decomposition derived from eigendecomposition, with rank-k truncation applied to grayscale images.',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
    openedAt: daysAgo(3),
    lastPage: 7,
    bookmarked: false,
  },
  {
    id: 'd_6',
    name: 'Operating Systems Notes.pdf',
    type: 'pdf',
    size: 2_950_144,
    pages: 52,
    collectionId: 'c_os',
    tags: ['scheduling', 'memory'],
    status: 'ready',
    excerpt:
      'Process lifecycle, CPU scheduling algorithms with Gantt charts, paging and segmentation, and deadlock handling.',
    createdAt: daysAgo(18),
    updatedAt: daysAgo(18),
    openedAt: daysAgo(5),
    lastPage: 31,
    bookmarked: false,
  },
  {
    id: 'd_7',
    name: 'Indexing and B+ Trees.pdf',
    type: 'pdf',
    size: 1_650_688,
    pages: 21,
    collectionId: 'c_dbms',
    tags: ['indexing'],
    status: 'ready',
    excerpt:
      'Dense versus sparse indexes, B+ tree insertion and deletion walkthroughs, and cost estimates for range queries.',
    createdAt: daysAgo(21),
    updatedAt: daysAgo(21),
    openedAt: daysAgo(7),
    lastPage: 9,
    bookmarked: false,
  },
  {
    id: 'd_8',
    name: 'Transactions cheat sheet.txt',
    type: 'txt',
    size: 12_288,
    pages: 3,
    collectionId: 'c_dbms',
    tags: ['acid', 'revision'],
    status: 'ready',
    excerpt: 'ACID properties, isolation levels and the anomalies each one permits, in one page.',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30),
    openedAt: daysAgo(11),
    lastPage: 1,
    bookmarked: false,
  },
  {
    id: 'd_9',
    name: 'Lecture whiteboard — joins.png',
    type: 'image',
    size: 842_752,
    pages: 1,
    collectionId: 'c_dbms',
    tags: ['joins', 'photo'],
    status: 'ready',
    excerpt: 'Photographed whiteboard comparing nested-loop, hash and sort-merge join costs. Text recovered with OCR.',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    openedAt: daysAgo(4),
    lastPage: 1,
    bookmarked: false,
  },
  {
    id: 'd_10',
    name: 'Graph algorithms.md',
    type: 'md',
    size: 36_864,
    pages: 7,
    collectionId: 'c_dsa',
    tags: ['graphs'],
    status: 'ready',
    excerpt: 'Dijkstra, Bellman-Ford and topological sort with complexity notes and edge cases to watch for.',
    createdAt: daysAgo(26),
    updatedAt: daysAgo(26),
    openedAt: daysAgo(13),
    lastPage: 2,
    bookmarked: false,
  },
  {
    id: 'd_11',
    name: 'Memory project spec.md',
    type: 'md',
    size: 24_576,
    pages: 5,
    collectionId: 'c_projects',
    tags: ['spec'],
    status: 'ready',
    excerpt: 'Scope, data model and milestones for the semester project, including the retrieval pipeline sketch.',
    createdAt: daysAgo(40),
    updatedAt: daysAgo(33),
    openedAt: daysAgo(16),
    lastPage: 3,
    bookmarked: false,
  },
];

/** Page-level extracted text — mirrors what the backend stores per chunk. */
export const documentPages = {
  d_1: {
    1: 'Unit 3 — Normalization. Redundancy in a poorly designed relation shows up as update, insertion and deletion anomalies. Normalization is the process of decomposing relations so that each fact is stored exactly once, guided by the functional dependencies that hold over the attributes.',
    2: 'A functional dependency X → Y means that any two tuples agreeing on X must agree on Y. Armstrong\'s axioms — reflexivity, augmentation and transitivity — let you derive the full closure of a dependency set, which is what the normal form tests are run against.',
    11: 'Partial dependency occurs when a non-prime attribute depends on part of a composite candidate key rather than the whole key.',
    12: 'A relation is in second normal form when it is in first normal form and every non-prime attribute is fully functionally dependent on the entire primary key. Removing partial dependencies usually means splitting the relation into two, one holding the attributes that depend on the partial key.',
    13: 'Worked example: STUDENT_COURSE(student_id, course_id, course_name, grade). Because course_name depends only on course_id, the relation violates 2NF and is decomposed into COURSE(course_id, course_name) and ENROLMENT(student_id, course_id, grade).',
    24: 'Third normal form additionally removes transitive dependencies: no non-prime attribute may determine another non-prime attribute.',
  },
  d_2: {
    1: 'Unit 1 — Foundations. A database management system sits between applications and stored data, providing a logical view that survives changes to physical storage. The three-schema architecture separates external views, the conceptual schema and the internal schema.',
    19: 'A candidate key is a minimal superkey: no proper subset of it still identifies tuples uniquely. The designer promotes exactly one candidate key to primary key; the remainder are alternate keys and can still carry uniqueness constraints.',
  },
  d_6: {
    1: 'A process is a program in execution, tracked by the operating system through a process control block holding its registers, memory map, open files and scheduling state.',
    31: 'Paging removes external fragmentation by splitting the address space into fixed-size pages mapped through a page table. The cost is internal fragmentation in the final page and an extra memory reference per access, which the TLB is there to absorb.',
  },
  d_3: {
    1: 'Revision notes — data structures. Each section states the invariant first, then the operations that must preserve it, because most exam mistakes come from breaking an invariant rather than from the algorithm itself.',
    4: 'A circular queue reuses the space freed at the front by advancing indices modulo the capacity. The queue is full when (rear + 1) % capacity equals front, which is why one slot is normally left unused.',
  },
  d_5: {
    1: 'Any real matrix A can be written as UΣVᵀ, where U and V are orthogonal and Σ is diagonal with non-negative entries ordered from largest to smallest. Those entries are the singular values.',
    7: 'Truncating the decomposition to the largest k singular values yields the best rank-k approximation of the image under the Frobenius norm, storing k(m + n + 1) values instead of mn.',
  },
  d_7: {
    9: 'A clustered index determines the physical ordering of rows, so a table may have only one. Secondary indexes store pointers and add write cost on every insert.',
  },
};

export const bookmarks = [
  {
    id: 'b_1',
    documentId: 'd_1',
    documentName: 'DBMS Normalization.pdf',
    documentType: 'pdf',
    page: 12,
    savedAt: hoursAgo(4),
    excerpt:
      'A relation is in second normal form when it is in first normal form and every non-prime attribute is fully functionally dependent on the entire primary key.',
    note: 'Use this wording in the answer sheet.',
  },
  {
    id: 'b_2',
    documentId: 'd_3',
    documentName: 'DSA Notes.md',
    documentType: 'md',
    page: 4,
    savedAt: daysAgo(2),
    excerpt: 'The queue is full when (rear + 1) % capacity equals front, which is why one slot is normally left unused.',
    note: '',
  },
  {
    id: 'b_3',
    documentId: 'd_7',
    documentName: 'Indexing and B+ Trees.pdf',
    documentType: 'pdf',
    page: 9,
    savedAt: daysAgo(6),
    excerpt: 'A clustered index determines the physical ordering of rows, so a table may have only one.',
    note: 'Compare with secondary index write cost.',
  },
  {
    id: 'b_4',
    documentId: 'd_5',
    documentName: 'SVD Image Compression.pdf',
    documentType: 'pdf',
    page: 7,
    savedAt: daysAgo(9),
    excerpt: 'Truncating to the largest k singular values yields the best rank-k approximation under the Frobenius norm.',
    note: '',
  },
];

export const activity = [
  { id: 'a_1', kind: 'upload', label: 'Probability Unit 2.pdf', detail: 'Added to Mathematics', at: hoursAgo(1) },
  { id: 'a_2', kind: 'ask', label: 'What is normalization?', detail: '3 sources', at: hoursAgo(3) },
  { id: 'a_3', kind: 'bookmark', label: 'DBMS Normalization.pdf', detail: 'Page 12', at: hoursAgo(4) },
  { id: 'a_4', kind: 'collection', label: 'Operating Systems', detail: 'Collection created', at: daysAgo(2) },
  { id: 'a_5', kind: 'search', label: 'circular queue implementation', detail: '6 results', at: daysAgo(2) },
];

export const searchHistory = [
  { id: 's_1', query: '2NF explanation', at: hoursAgo(3), resultCount: 8 },
  { id: 's_2', query: 'SVD image compression', at: daysAgo(1), resultCount: 5 },
  { id: 's_3', query: 'circular queue implementation', at: daysAgo(2), resultCount: 6 },
  { id: 's_4', query: 'difference between primary key and candidate key', at: daysAgo(3), resultCount: 9 },
  { id: 's_5', query: 'deadlock prevention conditions', at: daysAgo(5), resultCount: 4 },
];

export const searchResults = [
  {
    id: 'r_1',
    documentId: 'd_1',
    documentName: 'DBMS Normalization.pdf',
    documentType: 'pdf',
    collectionName: 'DBMS',
    page: 12,
    score: 0.94,
    tags: ['normalization', 'unit 3'],
    excerpt:
      'A relation is in second normal form when it is in first normal form and every non-prime attribute is fully functionally dependent on the entire primary key.',
  },
  {
    id: 'r_2',
    documentId: 'd_1',
    documentName: 'DBMS Normalization.pdf',
    documentType: 'pdf',
    collectionName: 'DBMS',
    page: 13,
    score: 0.88,
    tags: ['normalization'],
    excerpt:
      'Because course_name depends only on course_id, the relation violates 2NF and is decomposed into COURSE(course_id, course_name) and ENROLMENT(student_id, course_id, grade).',
  },
  {
    id: 'r_3',
    documentId: 'd_8',
    documentName: 'Transactions cheat sheet.txt',
    documentType: 'txt',
    collectionName: 'DBMS',
    page: 1,
    score: 0.71,
    tags: ['revision'],
    excerpt:
      'Normal forms summary: 1NF atomic values, 2NF no partial dependency, 3NF no transitive dependency, BCNF every determinant is a candidate key.',
  },
  {
    id: 'r_4',
    documentId: 'd_2',
    documentName: 'DBMS Unit 1.pdf',
    documentType: 'pdf',
    collectionName: 'DBMS',
    page: 19,
    score: 0.64,
    tags: ['fundamentals'],
    excerpt:
      'A candidate key is a minimal superkey; the designer promotes exactly one candidate key to primary key, and the rest remain alternate keys.',
  },
  {
    id: 'r_5',
    documentId: 'd_7',
    documentName: 'Indexing and B+ Trees.pdf',
    documentType: 'pdf',
    collectionName: 'DBMS',
    page: 9,
    score: 0.52,
    tags: ['indexing'],
    excerpt:
      'Decomposition changes the access pattern, so re-check which indexes the resulting relations need before deploying the schema change.',
  },
];

export const chats = [
  {
    id: 'ch_1',
    title: 'Normalization concepts',
    updatedAt: hoursAgo(3),
    scope: { type: 'all' },
    messages: [
      { id: 'm_1', role: 'user', content: 'Explain 2NF with an example.', at: hoursAgo(3) },
      {
        id: 'm_2',
        role: 'assistant',
        at: hoursAgo(3),
        content:
          'A relation is in second normal form when it is already in 1NF and every non-prime attribute depends on the whole primary key rather than a part of it. Partial dependency is only possible when the key is composite, so relations with a single-attribute key are in 2NF by default.\n\nIn your Unit 3 notes the example is STUDENT_COURSE(student_id, course_id, course_name, grade). The key is (student_id, course_id), but course_name is determined by course_id alone. Splitting it into COURSE(course_id, course_name) and ENROLMENT(student_id, course_id, grade) removes the partial dependency and the redundancy that came with it.',
        sources: [
          {
            documentId: 'd_1',
            documentName: 'DBMS Normalization.pdf',
            documentType: 'pdf',
            page: 12,
            excerpt:
              'A relation is in second normal form when it is in first normal form and every non-prime attribute is fully functionally dependent on the entire primary key.',
          },
          {
            documentId: 'd_1',
            documentName: 'DBMS Normalization.pdf',
            documentType: 'pdf',
            page: 13,
            excerpt:
              'STUDENT_COURSE(student_id, course_id, course_name, grade) violates 2NF because course_name depends only on course_id.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch_2',
    title: 'Explain SVD',
    updatedAt: daysAgo(1),
    scope: { type: 'collection', id: 'c_maths', label: 'Mathematics' },
    messages: [],
  },
  { id: 'ch_3', title: 'Probability formulas', updatedAt: daysAgo(3), scope: { type: 'all' }, messages: [] },
  { id: 'ch_4', title: 'DBMS indexing', updatedAt: daysAgo(6), scope: { type: 'all' }, messages: [] },
];

export const suggestedQuestions = [
  'What is 2NF?',
  'Explain circular queue.',
  'Difference between primary key and candidate key?',
  'Explain SVD in image compression.',
];

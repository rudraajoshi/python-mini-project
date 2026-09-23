export const ACCEPTED_FILE_TYPES = ['.pdf', '.txt', '.md', '.png', '.jpg', '.jpeg'];

export const PROCESSING_STAGES = ['uploading', 'processing', 'indexing', 'ready'];

export const PROCESSING_LABELS = {
  uploading: 'Uploading',
  processing: 'Processing',
  indexing: 'Indexing',
  ready: 'Ready',
  failed: 'Failed',
};

export const DOCUMENT_TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'md', label: 'Markdown' },
  { value: 'txt', label: 'Text' },
  { value: 'image', label: 'Image' },
];

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently added' },
  { value: 'opened', label: 'Recently opened' },
  { value: 'name', label: 'Name' },
];

export const STORAGE_KEYS = {
  access: 'pdm.access',
  refresh: 'pdm.refresh',
  user: 'pdm.user',
};

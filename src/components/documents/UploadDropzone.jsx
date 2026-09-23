import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';
import { ACCEPTED_FILE_TYPES } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';

export default function UploadDropzone({ onFiles }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length) onFiles(files);
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className="relative"
    >
      <motion.button
        type="button"
        onClick={() => inputRef.current?.click()}
        animate={{ scale: dragging ? 1.005 : 1 }}
        transition={{ duration: 0.18 }}
        className={cn(
          'flex w-full flex-col items-center rounded-lg border border-dashed px-6 py-10 text-center transition-colors duration-200',
          dragging ? 'border-accent bg-accent-soft/60' : 'border-line-strong bg-raised hover:border-faint'
        )}
      >
        <motion.span
          animate={{ y: dragging ? -3 : 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'mb-3.5 flex h-11 w-11 items-center justify-center rounded-lg border transition-colors duration-200',
            dragging ? 'border-accent-line bg-surface text-accent' : 'border-line bg-surface text-faint'
          )}
        >
          <UploadCloud size={19} strokeWidth={1.7} aria-hidden />
        </motion.span>
        <span className="text-base font-medium text-ink">
          {dragging ? 'Drop your documents here' : 'Drop files here, or browse'}
        </span>
        <span className="mt-1 text-meta text-muted">
          {ACCEPTED_FILE_TYPES.join(' · ').toUpperCase().replace(/\./g, '')} — up to 50 MB each
        </span>
      </motion.button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_FILE_TYPES.join(',')}
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) onFiles(files);
          event.target.value = '';
        }}
      />
    </div>
  );
}

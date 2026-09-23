import { motion } from 'framer-motion';
import SourceReference from '../search/SourceReference.jsx';
import { ChatResponseSkeleton } from '../ui/Skeleton.jsx';

function Answer({ content }) {
  return (
    <div className="max-w-[72ch] space-y-4">
      {content.split('\n\n').map((paragraph, index) => (
        <p key={index} className="text-reading leading-[1.7] text-ink-soft">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export default function ChatMessage({ message, pending = false }) {
  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-end"
      >
        <p className="max-w-[52ch] rounded-lg rounded-br-sm border border-line bg-raised px-3.5 py-2.5 text-reading leading-relaxed text-ink">
          {message.content}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      className="border-l-2 border-accent/25 pl-4 sm:pl-5"
    >
      {pending ? <ChatResponseSkeleton /> : <Answer content={message.content} />}

      {!pending && message.sources?.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-meta font-medium text-muted">
            Sources · {message.sources.length}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {message.sources.map((source, index) => (
              <SourceReference key={`${source.documentId}-${source.page}`} source={source} index={index} />
            ))}
          </div>
        </div>
      )}

      {!pending && message.sources?.length === 0 && (
        <p className="mt-4 rounded-md border border-dashed border-line px-3 py-2 text-meta text-muted">
          No supporting pages in your library matched this question.
        </p>
      )}
    </motion.div>
  );
}

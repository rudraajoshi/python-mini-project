import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, MessageSquareQuote, Search } from 'lucide-react';
import Logo from '../components/app/Logo.jsx';

const points = [
  { icon: BookOpen, title: 'Everything in one library', body: 'Lecture PDFs, markdown notes and photographed whiteboards, read page by page.' },
  { icon: Search, title: 'Search by meaning', body: 'Ask for the idea you remember, not the words you underlined.' },
  { icon: MessageSquareQuote, title: 'Answers with sources', body: 'Every answer points back to the document and page it came from.' },
];

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <aside className="relative hidden flex-col justify-between border-r border-line bg-raised px-12 py-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <Logo size={24} />
          <span className="text-base font-semibold tracking-[-0.01em] text-ink">Personal Digital Memory</span>
        </div>

        <div className="max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-display font-semibold leading-tight tracking-[-0.025em] text-ink"
          >
            A private memory for everything you read.
          </motion.h2>
          <p className="mt-4 max-w-[46ch] text-reading leading-relaxed text-muted">
            Upload what you study. Find it again by describing it. Get answers that cite the page they came from.
          </p>

          <ul className="mt-10 space-y-6 border-t border-line pt-8">
            {points.map((point, index) => (
              <motion.li
                key={point.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-3.5"
              >
                <point.icon size={16} strokeWidth={1.8} aria-hidden className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-base font-medium text-ink">{point.title}</p>
                  <p className="mt-0.5 max-w-[42ch] text-sm leading-relaxed text-muted">{point.body}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="text-meta text-faint">Your library stays yours. Nothing is shared or used for training.</p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[392px]">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logo size={22} />
            <span className="text-sm font-semibold tracking-[-0.01em] text-ink">Personal Digital Memory</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <div key={location.pathname}>
              <Outlet />
            </div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

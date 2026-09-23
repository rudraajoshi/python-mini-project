import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button.jsx';
import Logo from '../components/app/Logo.jsx';

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.26 }}
      className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center"
    >
      <Logo size={26} />
      <p className="mt-8 text-meta font-medium text-faint">Error 404</p>
      <h1 className="mt-2 text-title font-semibold tracking-[-0.02em] text-ink">This page isn’t in your library</h1>
      <p className="mt-2 max-w-sm text-base leading-relaxed text-muted">
        The link may be out of date, or the document it pointed to was deleted.
      </p>
      <div className="mt-7 flex items-center gap-2">
        <Button as={Link} to="/dashboard" variant="primary" size="lg">
          Back to home
        </Button>
        <Button as={Link} to="/documents" size="lg">
          Browse documents
        </Button>
      </div>
    </motion.div>
  );
}

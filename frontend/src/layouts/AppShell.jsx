import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/app/Sidebar.jsx';
import Topbar from '../components/app/Topbar.jsx';
import UploadModal from '../components/documents/UploadModal.jsx';
import { listCollections } from '../api/collectionsApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { useHotkey } from '../hooks/useHotkey.js';
import { useToast } from '../context/ToastContext.jsx';

export default function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const { data } = useAsync(() => listCollections(), []);
  const collections = data?.results ?? [];

  useEffect(() => setNavOpen(false), [location.pathname]);
  useHotkey('k', () => navigate('/search'));
  useHotkey('u', () => setUploadOpen(true));

  const handleUploaded = useCallback(
    (document) => {
      toast.success('Upload started', `${document.name} is being processed.`);
    },
    [toast]
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] lg:block">
        <Sidebar collections={collections} />
      </aside>

      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setNavOpen(false)}
              className="fixed inset-0 z-40 bg-ink/25 lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] lg:hidden"
            >
              <Sidebar collections={collections} onNavigate={() => setNavOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-[248px]">
        <Topbar onOpenNav={() => setNavOpen(true)} onUpload={() => setUploadOpen(true)} />
        {/* Keyed on the path so pages cross-fade while the shell stays mounted. */}
        <AnimatePresence mode="wait" initial={false}>
          <div key={location.pathname}>
            <Outlet context={{ collections, openUpload: () => setUploadOpen(true) }} />
          </div>
        </AnimatePresence>
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        collections={collections}
        onUploaded={handleUploaded}
      />
    </div>
  );
}

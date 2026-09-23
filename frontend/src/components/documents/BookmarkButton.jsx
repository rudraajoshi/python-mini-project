import { motion, useAnimationControls } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import Tooltip from '../ui/Tooltip.jsx';
import { cn } from '../../utils/cn.js';

export default function BookmarkButton({ active = false, onToggle, size = 16, className }) {
  const controls = useAnimationControls();

  async function handleClick(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!active) {
      controls.start({ scale: [1, 1.22, 0.96, 1], transition: { duration: 0.32, ease: 'easeOut' } });
    }
    onToggle?.(!active);
  }

  return (
    <Tooltip label={active ? 'Remove bookmark' : 'Bookmark'}>
      <motion.button
        type="button"
        animate={controls}
        onClick={handleClick}
        aria-pressed={active}
        aria-label={active ? 'Remove bookmark' : 'Bookmark'}
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center rounded border border-transparent transition-colors duration-150',
          active ? 'text-accent hover:bg-accent-soft' : 'text-faint hover:bg-sunken hover:text-ink',
          className
        )}
      >
        <Bookmark size={size} strokeWidth={1.9} fill={active ? 'currentColor' : 'none'} aria-hidden />
      </motion.button>
    </Tooltip>
  );
}

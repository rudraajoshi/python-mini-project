import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export default function Spinner({ size = 16, className }) {
  return <Loader2 size={size} strokeWidth={2} className={cn('animate-spin text-faint', className)} aria-hidden />;
}

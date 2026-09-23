import { FileImage, FileText, FileType2, File } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const registry = {
  pdf: { icon: FileType2, tone: 'text-[#B42318] bg-[#FDECEA]' },
  md: { icon: FileText, tone: 'text-[#4F6DF5] bg-accent-soft' },
  txt: { icon: FileText, tone: 'text-[#6B7280] bg-sunken' },
  image: { icon: FileImage, tone: 'text-[#177245] bg-positive-soft' },
};

export default function DocumentIcon({ type = 'txt', size = 'md', className }) {
  const { icon: Icon, tone } = registry[type] ?? { icon: File, tone: 'text-muted bg-sunken' };
  const box = size === 'sm' ? 'h-6 w-6 rounded' : size === 'lg' ? 'h-10 w-10 rounded-lg' : 'h-8 w-8 rounded-md';
  const glyph = size === 'sm' ? 12 : size === 'lg' ? 19 : 15;

  return (
    <span className={cn('flex shrink-0 items-center justify-center', box, tone, className)}>
      <Icon size={glyph} strokeWidth={1.8} aria-hidden />
    </span>
  );
}

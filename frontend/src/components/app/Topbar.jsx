import { Link, useNavigate } from 'react-router-dom';
import { Menu, Plus, Search } from 'lucide-react';
import Logo from './Logo.jsx';
import IconButton from '../ui/IconButton.jsx';

/** Mobile and tablet header: opens the nav drawer, keeps search and upload one tap away. */
export default function Topbar({ onOpenNav, onUpload }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-canvas/85 px-3 backdrop-blur-md lg:hidden">
      <IconButton icon={Menu} label="Open navigation" onClick={onOpenNav} tooltip={false} />
      <Link to="/dashboard" className="flex items-center gap-2 rounded px-1">
        <Logo size={20} />
        <span className="text-sm font-semibold tracking-[-0.01em] text-ink">Memory</span>
      </Link>
      <div className="ml-auto flex items-center gap-1">
        <IconButton icon={Search} label="Search" onClick={() => navigate('/search')} tooltip={false} />
        <IconButton icon={Plus} label="Upload document" onClick={onUpload} tooltip={false} />
      </div>
    </header>
  );
}

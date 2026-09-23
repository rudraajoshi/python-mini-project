import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bookmark,
  ChevronRight,
  FileText,
  Folder,
  Home,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';
import DropdownMenu from '../ui/DropdownMenu.jsx';

const primaryNav = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/collections', label: 'Collections', icon: Folder },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
];

function NavItem({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink to={to} end={end} onClick={onNavigate}>
      {({ isActive }) => (
        <span
          className={cn(
            'group relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors duration-150',
            isActive ? 'bg-accent-soft font-medium text-accent' : 'text-muted hover:bg-sunken hover:text-ink'
          )}
        >
          {isActive && (
            <motion.span
              layoutId="nav-indicator"
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -left-2 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-accent"
            />
          )}
          <Icon
            size={15}
            strokeWidth={1.9}
            aria-hidden
            className="shrink-0 transition-transform duration-200 group-hover:translate-x-[1px]"
          />
          <span className="truncate">{label}</span>
        </span>
      )}
    </NavLink>
  );
}

function SidebarSection({ children }) {
  return <p className="mb-1.5 px-2.5 text-2xs font-medium tracking-[0.01em] text-faint">{children}</p>;
}

export default function Sidebar({ collections = [], onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col border-r border-line bg-raised">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <Logo />
        <span className="text-sm font-semibold leading-tight tracking-[-0.01em] text-ink">
          Personal Digital<br />Memory
        </span>
      </div>

      <nav className="scrollarea flex-1 overflow-y-auto px-3 pb-4 pt-2" aria-label="Main">
        <div className="space-y-0.5">
          {primaryNav.map((item) => (
            <NavItem key={item.to} {...item} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="mt-6 space-y-0.5">
          <SidebarSection>Assistant</SidebarSection>
          <NavItem to="/ask" label="Ask your knowledge" icon={Sparkles} onNavigate={onNavigate} />
        </div>

        {collections.length > 0 && (
          <div className="mt-6">
            <SidebarSection>Collections</SidebarSection>
            <div className="space-y-0.5">
              {collections.slice(0, 5).map((collection) => (
                <NavLink
                  key={collection.id}
                  to={`/collections/${collection.id}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors duration-150',
                      isActive ? 'bg-sunken font-medium text-ink' : 'text-muted hover:bg-sunken hover:text-ink'
                    )
                  }
                >
                  <span
                    className="h-[7px] w-[7px] shrink-0 rounded-[2px]"
                    style={{ backgroundColor: collection.accent }}
                    aria-hidden
                  />
                  <span className="truncate">{collection.name}</span>
                  <span className="ml-auto text-2xs tabular-nums text-faint opacity-0 transition-opacity group-hover:opacity-100">
                    {collection.documentCount}
                  </span>
                </NavLink>
              ))}
              <NavLink
                to="/collections"
                onClick={onNavigate}
                className="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm text-faint transition-colors hover:bg-sunken hover:text-ink"
              >
                <ChevronRight size={14} strokeWidth={2} aria-hidden className="shrink-0" />
                All collections
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-line p-3">
        <DropdownMenu
          align="left"
          items={[
            { label: 'Settings', icon: Settings, onSelect: () => navigate('/dashboard') },
            { label: 'Recent chats', icon: MessageSquare, onSelect: () => navigate('/ask') },
            { separator: true },
            { label: 'Sign out', icon: LogOut, destructive: true, onSelect: logout },
          ]}
          trigger={({ toggle, open }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors duration-150',
                open ? 'bg-sunken' : 'hover:bg-sunken'
              )}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-ink text-2xs font-semibold text-white">
                {initials(user?.name ?? 'User')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{user?.name}</span>
                <span className="block truncate text-2xs text-faint">{user?.email}</span>
              </span>
              <Settings size={14} strokeWidth={1.9} aria-hidden className="shrink-0 text-faint" />
            </button>
          )}
        />
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  Newspaper,
  Hash,
  Sparkles,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Menu,
  X,
  User,
  LayoutDashboard,
  FileText,
  Bookmark,
  Settings,
  LogOut,
} from 'lucide-react';

/* ── Clerk shims (graceful fallback when not in Clerk context) ── */
let UserButton: any = null;
let SignedIn: any = ({ children }: { children: React.ReactNode }) => null;
let SignedOut: any = ({ children }: { children: React.ReactNode }) => <>{children}</>;
let SignInButton: any = ({ children }: { children: React.ReactNode }) => <>{children}</>;

try {
  const clerkAstro = require('@clerk/astro/client');
  if (clerkAstro) {
    UserButton = clerkAstro.UserButton ?? null;
    SignedIn = clerkAstro.SignedIn ?? SignedIn;
    SignedOut = clerkAstro.SignedOut ?? SignedOut;
    SignInButton = clerkAstro.SignInButton ?? SignInButton;
  }
} catch {
  try {
    const clerkNext = require('@clerk/nextjs');
    if (clerkNext) {
      UserButton = clerkNext.UserButton ?? null;
      SignedIn = clerkNext.SignedIn ?? SignedIn;
      SignedOut = clerkNext.SignedOut ?? SignedOut;
      SignInButton = clerkNext.SignInButton ?? SignInButton;
    }
  } catch {
    /* no Clerk — UI falls back to standard state */
  }
}

/* ── Types ── */
export interface NavItem {
  label: string;
  href: string;
  description?: string;
  icon?: React.ComponentType<{ style?: React.CSSProperties }>;
  badge?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

/* ── Data ── */
const ECOSYSTEM_ITEMS: NavItem[] = [
  {
    label: 'Startups',
    href: '/startups',
    description: 'Discover trending high-growth tech startups & company profiles.',
    icon: Building2,
  },
  {
    label: 'Founders',
    href: '/founders',
    description: 'Connect with visionary founders, CTOs & technical leaders.',
    icon: Users,
  },
  {
    label: 'Investors & VCs',
    href: '/investors',
    description: 'Explore angel networks, VC funds & syndicate portfolios.',
    icon: Briefcase,
  },
  {
    label: 'Funding Tracker',
    href: '/funding',
    description: 'Real-time seed to Series D funding deals & venture rounds.',
    icon: TrendingUp,
    badge: 'LIVE',
  },
];

const EDITORIAL_ITEMS: NavItem[] = [
  {
    label: 'Feed & Articles',
    href: '/feed',
    description: 'Curated tech journalism, deep-dives & breaking news.',
    icon: Newspaper,
  },
  {
    label: 'Topics & Taxonomy',
    href: '/topics',
    description: 'Browse articles by AI, SaaS, FinTech & Web3 categories.',
    icon: Hash,
  },
  {
    label: 'Spotlight Showcase',
    href: '/showcase',
    description: 'Featured product launches, demo days & startup reveals.',
    icon: Sparkles,
  },
];

const AVATAR_MENU_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/dashboard/profile', icon: User },
  { label: 'My Startups', href: '/dashboard/startups', icon: Building2 },
  { label: 'My Articles', href: '/dashboard/articles', icon: FileText },
  { label: 'Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const NOTIFICATIONS_INIT: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New Funding Round Announced',
    description: 'Aura Health raised $12M Series A led by Accel.',
    time: '10m ago',
    unread: true,
  },
  {
    id: 'n2',
    title: 'New Spotlight Story',
    description: 'The Future of AI Hardware Agents in 2026 is published.',
    time: '1h ago',
    unread: true,
  },
];

/* ── Inline style constants derived from design.md tokens ── */
const S = {
  // Nav shell: 72px height, sticky, 12px blur, hairline border
  header: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
    width: '100%',
    height: '72px',
    borderBottom: '1px solid var(--color-hairline)',
    background: 'rgba(255, 255, 255, 0.96)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
    padding: '0 32px', // Exact 32px horizontal padding
    boxSizing: 'border-box' as const,
  },
  // Left cluster: Logo
  left: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--color-ink)',
    flexShrink: 0,
  },
  // Center nav: 28px item spacing
  centerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
  },
  navBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 0',
    border: 'none',
    background: 'transparent',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--color-steel)',
    cursor: 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
    transition: 'color 150ms ease',
    lineHeight: 1.4,
  },
  navBtnActive: {
    color: 'var(--color-ink)',
    fontWeight: 600,
  },
  // Dropdown wrapper (no gap)
  dropdownWrapper: {
    position: 'absolute' as const,
    left: 0,
    top: '100%',
    paddingTop: '6px',
    zIndex: 60,
  },
  dropdown: {
    width: '320px',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-hairline)',
    background: '#ffffff',
    padding: '12px',
    boxShadow: 'var(--shadow-atmospheric)',
  },
  dropdownLabel: {
    padding: '4px 8px 8px',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--color-stone)',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '10px',
    borderRadius: 'var(--radius-lg)',
    textDecoration: 'none',
    transition: 'background 120ms ease',
  },
  iconBox: {
    width: '32px',
    height: '32px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-hairline)',
    background: 'var(--color-surface)',
    color: 'var(--color-steel)',
    marginTop: '1px',
  },
  dropdownItemTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--color-ink)',
    lineHeight: 1.3,
  },
  dropdownItemDesc: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    color: 'var(--color-stone)',
    lineHeight: 1.4,
    marginTop: '2px',
  },
  badge: {
    padding: '2px 7px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-ink)',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
    flexShrink: 0,
  },
  badgeLive: {
    background: 'var(--color-brand-coral)',
  },
  // Right cluster: Search (320px), Bell, Avatar, Submit Startup CTA
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexShrink: 0,
  },
  searchPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    width: '320px', // Exact 320px search width
    height: '40px',
    padding: '0 14px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid var(--color-hairline)',
    background: 'var(--color-surface)',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 400,
    color: 'var(--color-stone)',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    boxSizing: 'border-box' as const,
  },
  kbd: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '1px 5px',
    borderRadius: '4px',
    border: '1px solid var(--color-hairline)',
    background: '#ffffff',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--color-slate)',
    boxShadow: '0 1px 0 var(--color-hairline)',
    marginLeft: 'auto',
  },
  iconBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid var(--color-hairline)',
    background: '#ffffff',
    color: 'var(--color-steel)',
    cursor: 'pointer',
    flexShrink: 0,
    position: 'relative' as const,
    transition: 'border-color 150ms ease, background 150ms ease',
  },
  avatarBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid var(--color-hairline)',
    background: 'var(--color-surface)',
    color: 'var(--color-ink)',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'border-color 150ms ease',
  },
  avatarDropdown: {
    position: 'absolute' as const,
    right: 0,
    top: 'calc(100% + 6px)',
    width: '220px',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-hairline)',
    background: '#ffffff',
    padding: '6px',
    boxShadow: 'var(--shadow-atmospheric)',
    zIndex: 60,
  },
  avatarMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-steel)',
    textDecoration: 'none',
    transition: 'background 120ms ease, color 120ms ease',
    width: '100%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left' as const,
    boxSizing: 'border-box' as const,
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '40px',
    padding: '0 20px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-primary)', // Black pill primary CTA (#0F172A)
    color: 'var(--color-on-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
    cursor: 'pointer',
    flexShrink: 0,
    border: 'none',
    transition: 'background 150ms ease, opacity 150ms ease',
  },
  notifPanel: {
    position: 'absolute' as const,
    right: 0,
    top: 'calc(100% + 6px)',
    width: '320px',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-hairline)',
    background: '#ffffff',
    boxShadow: 'var(--shadow-atmospheric)',
    zIndex: 60,
    overflow: 'hidden',
  },
  notifHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-hairline-soft)',
  },
  // Mobile drawer
  mobileToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-hairline)',
    background: 'transparent',
    color: 'var(--color-ink)',
    cursor: 'pointer',
  },
  mobileDrawer: {
    borderTop: '1px solid var(--color-hairline)',
    background: '#ffffff',
    padding: '16px 24px',
  },
  mobileLink: {
    display: 'block',
    padding: '10px 0',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--color-steel)',
    textDecoration: 'none',
    borderBottom: '1px solid var(--color-hairline-soft)',
  },
};

/* ── Chevron icon ── */
function Caret({ open }: { open: boolean }) {
  return (
    <ChevronDown
      style={{
        width: '14px',
        height: '14px',
        color: 'var(--color-stone)',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 200ms ease',
        flexShrink: 0,
      }}
    />
  );
}

/* ── Dropdown menu item ── */
function DropItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon!;
  const active = pathname.startsWith(item.href);
  const isLive = item.badge === 'LIVE';
  return (
    <a
      href={item.href}
      role="menuitem"
      style={{
        ...S.dropdownItem,
        background: active ? 'var(--color-surface)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = active ? 'var(--color-surface)' : 'transparent';
      }}
    >
      <div style={S.iconBox}>
        <Icon style={{ width: '15px', height: '15px' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={S.dropdownItemTitle}>{item.label}</span>
          {item.badge && (
            <span style={{ ...S.badge, ...(isLive ? S.badgeLive : {}) }}>{item.badge}</span>
          )}
        </div>
        {item.description && (
          <p style={S.dropdownItemDesc}>{item.description}</p>
        )}
      </div>
    </a>
  );
}

/* ── Main Navbar component ── */
export function Navbar({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const [pathname, setPathname] = useState('/');
  const [activeMenu, setActiveMenu] = useState<'ecosystem' | 'editorial' | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications] = useState<NotificationItem[]>(NOTIFICATIONS_INIT);

  const headerRef = useRef<HTMLElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unread = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    setPathname(window.location.pathname);
    // Determine login state from Clerk or cookie/session fallback
    if (typeof window !== 'undefined') {
      const hasSession = document.cookie.includes('clerk') || document.cookie.includes('sb-') || localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(hasSession);
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch
          ? onOpenSearch()
          : window.dispatchEvent(new CustomEvent('toggle-search-palette'));
      }
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setAvatarOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onOpenSearch]);

  useEffect(() => {
    const handleOut = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOut);
    return () => document.removeEventListener('mousedown', handleOut);
  }, []);

  const openMenu = (key: 'ecosystem' | 'editorial') => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(key);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 200);
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const navBtnStyle = (active: boolean) => ({
    ...S.navBtn,
    ...(active ? S.navBtnActive : {}),
  });

  return (
    <header ref={headerRef} style={S.header} role="banner">
      <div style={S.inner}>

        {/* ── LEFT: Logo ── */}
        <div style={S.left}>
          <a href="/" style={S.logo} aria-label="Carcblog home">
            Carcblog
          </a>
        </div>

        {/* ── CENTER: Primary Navigation Links (28px gap, single horizontal line) ── */}
        <nav
          style={S.centerNav}
          className="nav-center-desktop"
          aria-label="Primary navigation"
        >
          {/* Ecosystem dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => openMenu('ecosystem')}
            onMouseLeave={scheduleClose}
          >
            <button
              style={navBtnStyle(
                ECOSYSTEM_ITEMS.some((i) => isActive(i.href)) || activeMenu === 'ecosystem'
              )}
              aria-expanded={activeMenu === 'ecosystem'}
              aria-haspopup="menu"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === 'ecosystem' ? null : 'ecosystem');
              }}
            >
              Ecosystem
              <Caret open={activeMenu === 'ecosystem'} />
            </button>

            {activeMenu === 'ecosystem' && (
              <div style={S.dropdownWrapper}>
                <div
                  data-ecosystem-menu
                  style={S.dropdown}
                  role="menu"
                  aria-label="Ecosystem navigation"
                  onMouseEnter={() => openMenu('ecosystem')}
                  onMouseLeave={scheduleClose}
                >
                  <div style={S.dropdownLabel}>Startup Hub &amp; Directories</div>
                  {ECOSYSTEM_ITEMS.map((item) => (
                    <DropItem key={item.href} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Editorial dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => openMenu('editorial')}
            onMouseLeave={scheduleClose}
          >
            <button
              style={navBtnStyle(
                EDITORIAL_ITEMS.some((i) => isActive(i.href)) || activeMenu === 'editorial'
              )}
              aria-expanded={activeMenu === 'editorial'}
              aria-haspopup="menu"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === 'editorial' ? null : 'editorial');
              }}
            >
              Editorial
              <Caret open={activeMenu === 'editorial'} />
            </button>

            {activeMenu === 'editorial' && (
              <div style={S.dropdownWrapper}>
                <div
                  data-editorial-menu
                  style={S.dropdown}
                  role="menu"
                  aria-label="Editorial navigation"
                  onMouseEnter={() => openMenu('editorial')}
                  onMouseLeave={scheduleClose}
                >
                  <div style={S.dropdownLabel}>Journalism &amp; Publications</div>
                  {EDITORIAL_ITEMS.map((item) => (
                    <DropItem key={item.href} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Standalone links */}
          {[
            { label: 'Discover', href: '/discover' },
            { label: 'Writers', href: '/writers' },
            { label: 'About', href: '/about' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={navBtnStyle(isActive(link.href))}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── RIGHT: Search (320px), Bell (logged in), Avatar/Login, Submit Startup ── */}
        <div style={S.right}>

          {/* Search Pill (320px width) */}
          <button
            style={S.searchPill}
            className="nav-search-pill"
            onClick={() =>
              onOpenSearch
                ? onOpenSearch()
                : window.dispatchEvent(new CustomEvent('toggle-search-palette'))
            }
            aria-label="Search articles, startups, and founders"
          >
            <Search style={{ width: '14px', height: '14px', color: 'var(--color-stone)', flexShrink: 0 }} />
            <span>Search ecosystem...</span>
            <kbd style={S.kbd}>⌘K</kbd>
          </button>

          {/* Notification Bell (Hidden before login, visible after login) */}
          <SignedIn>
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                style={S.iconBtn}
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label={`Notifications (${unread} unread)`}
                aria-expanded={notifOpen}
              >
                <Bell style={{ width: '16px', height: '16px' }} />
                {unread > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: 'var(--color-brand-coral, #ef4444)',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-sans)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #ffffff',
                    }}
                  >
                    {unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div style={S.notifPanel}>
                  <div style={S.notifHeader}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
                      Notifications
                    </span>
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--color-hairline-soft)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
                            {n.title}
                          </span>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-stone)', flexShrink: 0 }}>
                            {n.time}
                          </span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-slate)', marginTop: '3px', marginBottom: 0 }}>
                          {n.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SignedIn>

          {/* Primary CTA: + Submit Startup */}
          <a
            href="/startups/new"
            style={S.submitBtn}
            className="nav-submit-btn"
            aria-label="Submit your startup"
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-hover, #1E293B)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-primary, #0F172A)';
            }}
          >
            <Plus style={{ width: '15px', height: '15px', flexShrink: 0 }} />
            <span>Submit Startup</span>
          </a>

          {/* User Auth: Login Button when Logged Out; Avatar & Dropdown when Logged In (FAR RIGHT) */}
          {UserButton ? (
            <>
              <SignedIn>
                <div ref={avatarRef} style={{ position: 'relative' }}>
                  <button
                    style={S.avatarBtn}
                    onClick={() => setAvatarOpen(!avatarOpen)}
                    aria-label="User menu"
                    aria-expanded={avatarOpen}
                  >
                    <User style={{ width: '18px', height: '18px' }} />
                  </button>

                  {avatarOpen && (
                    <div style={S.avatarDropdown} role="menu">
                      {AVATAR_MENU_ITEMS.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <a
                            key={item.href}
                            href={item.href}
                            role="menuitem"
                            style={S.avatarMenuItem}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                              (e.currentTarget as HTMLElement).style.color = 'var(--color-ink)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = 'transparent';
                              (e.currentTarget as HTMLElement).style.color = 'var(--color-steel)';
                            }}
                          >
                            <ItemIcon style={{ width: '15px', height: '15px', color: 'var(--color-steel)' }} />
                            <span>{item.label}</span>
                          </a>
                        );
                      })}
                      <div style={{ borderTop: '1px solid var(--color-hairline)', margin: '4px 0' }} />
                      <a
                        href="/api/auth/signout"
                        role="menuitem"
                        style={{
                          ...S.avatarMenuItem,
                          color: 'var(--color-error, #dc2626)',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(220, 38, 38, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }}
                      >
                        <LogOut style={{ width: '15px', height: '15px' }} />
                        <span>Logout</span>
                      </a>
                    </div>
                  )}
                </div>
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    style={{
                      ...S.navBtn,
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--color-hairline)',
                      background: 'transparent',
                      color: 'var(--color-ink)',
                      fontWeight: 600,
                    }}
                  >
                    Login
                  </button>
                </SignInButton>
              </SignedOut>
            </>
          ) : (
            <div ref={avatarRef} style={{ position: 'relative' }}>
              <button
                style={S.avatarBtn}
                onClick={() => setAvatarOpen(!avatarOpen)}
                aria-label="User menu"
                aria-expanded={avatarOpen}
              >
                <User style={{ width: '18px', height: '18px' }} />
              </button>

              {avatarOpen && (
                <div style={S.avatarDropdown} role="menu">
                  {AVATAR_MENU_ITEMS.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        style={S.avatarMenuItem}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                          (e.currentTarget as HTMLElement).style.color = 'var(--color-ink)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = 'var(--color-steel)';
                        }}
                      >
                        <ItemIcon style={{ width: '15px', height: '15px', color: 'var(--color-steel)' }} />
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                  <div style={{ borderTop: '1px solid var(--color-hairline)', margin: '4px 0' }} />
                  <a
                    href="/auth/sign-in"
                    role="menuitem"
                    style={{
                      ...S.avatarMenuItem,
                      color: 'var(--color-error, #dc2626)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(220, 38, 38, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <LogOut style={{ width: '15px', height: '15px' }} />
                    <span>Logout</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            style={S.mobileToggle}
            className="nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X style={{ width: '18px', height: '18px' }} />
            ) : (
              <Menu style={{ width: '18px', height: '18px' }} />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div style={S.mobileDrawer}>
          {[
            { label: 'Startups Directory', href: '/startups' },
            { label: 'Founders', href: '/founders' },
            { label: 'Investors & VCs', href: '/investors' },
            { label: 'Funding Tracker', href: '/funding' },
            { label: 'Feed & Articles', href: '/feed' },
            { label: 'Topics', href: '/topics' },
            { label: 'Spotlight Showcase', href: '/showcase' },
            { label: 'Discover', href: '/discover' },
            { label: 'Writers', href: '/writers' },
            { label: 'About', href: '/about' },
          ].map((link) => (
            <a key={link.href} href={link.href} style={S.mobileLink}>
              {link.label}
            </a>
          ))}
          <div style={{ paddingTop: '16px' }}>
            <a
              href="/startups/new"
              style={{
                ...S.submitBtn,
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <Plus style={{ width: '15px', height: '15px' }} />
              <span>Submit Startup</span>
            </a>
          </div>
        </div>
      )}

      {/* Responsive media query classes */}
      <style>{`
        .nav-center-desktop { display: none !important; }
        .nav-search-pill { display: none !important; }
        .nav-submit-btn { display: none !important; }
        .nav-mobile-toggle { display: inline-flex !important; }

        @media (min-width: 768px) {
          .nav-search-pill { display: inline-flex !important; }
        }
        @media (min-width: 1024px) {
          .nav-center-desktop { display: flex !important; }
          .nav-submit-btn { display: inline-flex !important; }
          .nav-mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}

export default Navbar;

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
  Heart,
  Clock,
  Settings,
  LogOut,
} from 'lucide-react';

/* ── Types ── */
export interface NavItem {
  label: string;
  href: string;
  description?: string;
  icon?: React.ComponentType<{ style?: React.CSSProperties }>;
  badge?: string;
}

export interface NavbarUser {
  id?: string;
  userId?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'reader' | 'writer' | 'admin' | string;
}

export interface NavbarProps {
  onOpenSearch?: () => void;
  user?: NavbarUser | null;
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

const READER_MENU_ITEMS = [
  { label: 'Following', href: '/dashboard/following', icon: Users },
  { label: 'Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
  { label: 'Liked Articles', href: '/dashboard/likes', icon: Heart },
  { label: 'Reading History', href: '/dashboard/history', icon: Clock },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const WRITER_MENU_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Articles', href: '/dashboard/articles', icon: FileText },
  { label: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
  { label: 'Following', href: '/dashboard/following', icon: Users },
  { label: 'Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
  { label: 'Liked Articles', href: '/dashboard/likes', icon: Heart },
  { label: 'Reading History', href: '/dashboard/history', icon: Clock },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

/* ── Inline style constants derived from design.md tokens ── */
const S = {
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
    padding: '0 32px',
    boxSizing: 'border-box' as const,
  },
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
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--color-stone)',
    padding: '4px 8px 8px 8px',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    transition: 'background 150ms ease',
  },
  dropdownItemActive: {
    background: 'var(--color-surface)',
  },
  iconBox: {
    width: '28px',
    height: '28px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-hairline)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--color-ink)',
    marginTop: '2px',
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
    fontWeight: 400,
    color: 'var(--color-steel)',
    margin: '2px 0 0 0',
    lineHeight: 1.4,
  },
  badge: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-surface-soft)',
    color: 'var(--color-slate)',
    letterSpacing: '0.04em',
  },
  badgeLive: {
    background: 'rgba(220, 38, 38, 0.1)',
    color: '#dc2626',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  searchPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-hairline)',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    color: 'var(--color-steel)',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 150ms ease',
  },
  kbd: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 600,
    padding: '1px 5px',
    borderRadius: 'var(--radius-xs)',
    background: 'var(--color-canvas)',
    border: '1px solid var(--color-hairline-strong)',
    color: 'var(--color-stone)',
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 150ms ease',
    whiteSpace: 'nowrap' as const,
  },
  avatarBtn: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--color-hairline-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-ink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    padding: 0,
  },
  avatarDropdown: {
    position: 'absolute' as const,
    right: 0,
    top: 'calc(100% + 8px)',
    width: '220px',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-hairline)',
    background: '#ffffff',
    padding: '6px',
    boxShadow: 'var(--shadow-modal)',
    zIndex: 70,
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
    transition: 'all 150ms ease',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  mobileToggle: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-hairline)',
    background: 'transparent',
    color: 'var(--color-ink)',
    cursor: 'pointer',
  },
  mobileDrawer: {
    position: 'fixed' as const,
    top: '72px',
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    zIndex: 49,
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    overflowY: 'auto' as const,
  },
  mobileLink: {
    fontFamily: 'var(--font-sans)',
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--color-ink)',
    textDecoration: 'none',
    padding: '8px 0',
    borderBottom: '1px solid var(--color-hairline-soft)',
  },
};

/* ── Dropdown Item Sub-component ── */
function DropItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon || Building2;
  const active = pathname.startsWith(item.href);
  const isLive = item.badge === 'LIVE';

  return (
    <a
      href={item.href}
      role="menuitem"
      style={{
        ...S.dropdownItem,
        ...(active ? S.dropdownItemActive : {}),
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
export function Navbar({ onOpenSearch, user }: NavbarProps) {
  const [pathname, setPathname] = useState('/');
  const [activeMenu, setActiveMenu] = useState<'ecosystem' | 'editorial' | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
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

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const clerk = (window as any).Clerk;
      if (clerk && typeof clerk.signOut === 'function') {
        await clerk.signOut({ redirectUrl: '/' });
      } else {
        window.location.href = '/api/auth/signout';
      }
    }
  };

  const isAuthenticated = !!(user && (user.userId || user.id));
  const userRole = user?.role || 'reader';
  const menuItems = (userRole === 'writer' || userRole === 'admin') ? WRITER_MENU_ITEMS : READER_MENU_ITEMS;

  return (
    <header ref={headerRef} style={S.header} role="banner">
      <div style={S.inner}>

        {/* ── LEFT: Logo ── */}
        <div style={S.left}>
          <a href="/" style={S.logo} aria-label="Carcblog home">
            Carcblog
          </a>
        </div>

        {/* ── CENTER: Primary Navigation Links ── */}
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
            >
              <span>Ecosystem</span>
              <ChevronDown style={{ width: '13px', height: '13px' }} />
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
            >
              <span>Editorial</span>
              <ChevronDown style={{ width: '13px', height: '13px' }} />
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
                  <div style={S.dropdownLabel}>Journalism &amp; Taxonomy</div>
                  {EDITORIAL_ITEMS.map((item) => (
                    <DropItem key={item.href} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Standalone links */}
          <a href="/discover" style={navBtnStyle(isActive('/discover'))}>
            Discover
          </a>
          <a href="/about" style={navBtnStyle(isActive('/about'))}>
            About
          </a>
        </nav>

        {/* ── RIGHT: Search, Submit, Auth Controls ── */}
        <div style={S.right}>

          {/* Search Trigger Pill */}
          <button
            style={S.searchPill}
            className="nav-search-pill"
            onClick={() =>
              onOpenSearch
                ? onOpenSearch()
                : window.dispatchEvent(new CustomEvent('toggle-search-palette'))
            }
            aria-label="Search ecosystem (⌘K)"
          >
            <Search style={{ width: '14px', height: '14px' }} />
            <span>Search ecosystem...</span>
            <span style={S.kbd}>⌘K</span>
          </button>


          {/* User Auth Section */}
          {isAuthenticated ? (
            <div ref={avatarRef} style={{ position: 'relative' }}>
              <button
                style={S.avatarBtn}
                onClick={() => setAvatarOpen(!avatarOpen)}
                aria-label="User menu"
                aria-expanded={avatarOpen}
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name || 'User'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>
                    {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </button>

              {avatarOpen && (
                <div style={S.avatarDropdown} role="menu">
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-hairline)', marginBottom: '4px' }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink-strong)' }}>
                      {user?.full_name || user?.username || 'Account'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--color-steel)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginTop: '2px' }}>
                      {userRole.toUpperCase()} ROLE
                    </div>
                  </div>

                  {menuItems.map((item) => {
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
                    onClick={handleLogout}
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
                    <span>Sign Out</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a
                href="/auth/sign-in"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--color-hairline-strong)',
                  background: 'transparent',
                  color: 'var(--color-ink)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Sign in
              </a>
              <a
                href="/auth/sign-up"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: '34px',
                  padding: '0 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Get started
              </a>
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
            { label: 'About', href: '/about' },
          ].map((link) => (
            <a key={link.href} href={link.href} style={S.mobileLink}>
              {link.label}
            </a>
          ))}

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

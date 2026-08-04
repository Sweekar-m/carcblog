'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
    label: 'Topics ',
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
  { label: 'Bookmarks', href: '/dashboard/profile', icon: Bookmark },
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
  { label: 'Bookmarks', href: '/dashboard/profile', icon: Bookmark },
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
    zIndex: 100000,
    width: '100%',
    height: '64px',
    borderBottom: '1px solid var(--color-hairline-soft)',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
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
    background: 'rgba(255, 90, 54, 0.12)',
    color: '#FF5A36',
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
    height: '36px',
    padding: '0 12px',
    borderRadius: 'var(--radius-md)',
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
  avatarBtn: {
    width: '40px',
    height: '40px',
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
    textDecoration: 'none',
  },
  avatarDropdown: {
    position: 'absolute' as const,
    right: 0,
    top: 'calc(100% + 8px)',
    width: '240px',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-hairline)',
    background: '#ffffff',
    padding: '8px',
    boxShadow: 'var(--shadow-modal)',
    zIndex: 70,
  },
  avatarMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
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
  mobileToggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-hairline)',
    background: 'transparent',
    color: 'var(--color-ink)',
    cursor: 'pointer',
    flexShrink: 0,
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

/* ── Mobile Accordion Section Component ── */
function MobileAccordionSection({
  categoryLabel,
  title,
  items,
  isOpen,
  onToggle,
  pathname,
  onLinkClick,
}: {
  categoryLabel: string;
  title: string;
  items: NavItem[];
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  onLinkClick: () => void;
}) {
  const isLive = (item: NavItem) => item.badge === 'LIVE';

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Category Micro Label */}
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-stone)',
          marginBottom: '6px',
          paddingLeft: '4px',
        }}
      >
        {categoryLabel}
      </div>

      {/* Accordion header button */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minHeight: '48px',
          padding: '0 4px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: '17px',
          fontWeight: 600,
          color: 'var(--color-ink)',
          textAlign: 'left' as const,
        }}
      >
        <span>{title}</span>
        <ChevronDown
          style={{
            width: '18px',
            height: '18px',
            color: 'var(--color-steel)',
            flexShrink: 0,
            transition: 'transform 200ms ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* Accordion items */}
      {isOpen && (
        <div
          style={{
            marginTop: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            animation: 'mobileAccordionIn 180ms ease',
          }}
        >
          {items.map((item) => {
            const Icon = item.icon || Building2;
            const active = pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={onLinkClick}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  background: active ? 'var(--color-surface)' : 'transparent',
                  border: '1px solid',
                  borderColor: active ? 'var(--color-hairline)' : 'transparent',
                  transition: 'background 120ms ease',
                }}
              >
                {/* Icon box */}
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-hairline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--color-ink)',
                    marginTop: '2px',
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px' }} />
                </div>

                {/* Text & Desc */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--color-ink)',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        style={{
                          ...S.badge,
                          ...(isLive(item) ? S.badgeLive : {}),
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12.5px',
                        fontWeight: 400,
                        color: 'var(--color-steel)',
                        margin: '2px 0 0',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Main Navbar component ── */
export function Navbar({ onOpenSearch, user }: NavbarProps) {
  const [pathname, setPathname] = useState('/');
  const [activeMenu, setActiveMenu] = useState<'ecosystem' | 'editorial' | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileEcosystemOpen, setMobileEcosystemOpen] = useState(true);
  const [mobileEditorialOpen, setMobileEditorialOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsMounted(true);
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
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onOpenSearch]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (mobileOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [mobileOpen]);

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

  const closeMobileDrawer = () => {
    setMobileOpen(false);
  };

  const isAuthenticated = !!(user && (user.userId || user.id));
  const userRole = user?.role || 'reader';
  const menuItems = (userRole === 'writer' || userRole === 'admin') ? WRITER_MENU_ITEMS : READER_MENU_ITEMS;

  /* ─────────────────────────────────────────────────────────────── */
  /*  MOBILE DRAWER PORTAL CONTENT                                   */
  /* ─────────────────────────────────────────────────────────────── */
  const mobileDrawerContent = mobileOpen ? (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={closeMobileDrawer}
        style={{
          position: 'fixed',
          inset: 0,
          top: '72px',
          background: 'rgba(15, 23, 42, 0.4)',
          zIndex: 99998,
          animation: 'mobileBackdropIn 200ms ease',
        }}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#ffffff',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          animation: 'mobileDrawerIn 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 32px' }}>

          {/* ── ZONE 1: Quick Search Bar ── */}
          <button
            onClick={() => {
              closeMobileDrawer();
              onOpenSearch
                ? onOpenSearch()
                : window.dispatchEvent(new CustomEvent('toggle-search-palette'));
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              minHeight: '48px',
              padding: '0 16px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-hairline-strong)',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: 'var(--color-steel)',
              cursor: 'pointer',
              marginBottom: '24px',
              textAlign: 'left' as const,
            }}
          >
            <Search style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>Search startups, topics, authors…</span>
          </button>

          {/* ── ZONE 2: Startup Ecosystem Accordion Section ── */}
          <MobileAccordionSection
            categoryLabel="Directory & Hub"
            title="Startup Ecosystem"
            items={ECOSYSTEM_ITEMS}
            isOpen={mobileEcosystemOpen}
            onToggle={() => setMobileEcosystemOpen((v) => !v)}
            pathname={pathname}
            onLinkClick={closeMobileDrawer}
          />

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--color-hairline)', marginBottom: '24px' }} />

          {/* ── ZONE 3: Editorial Accordion Section ── */}
          <MobileAccordionSection
            categoryLabel="Journalism & Content"
            title="Editorial & Topics"
            items={EDITORIAL_ITEMS}
            isOpen={mobileEditorialOpen}
            onToggle={() => setMobileEditorialOpen((v) => !v)}
            pathname={pathname}
            onLinkClick={closeMobileDrawer}
          />

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--color-hairline)', marginBottom: '24px' }} />

          {/* ── ZONE 4: Standalone Platform Pages ── */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-stone)',
                marginBottom: '10px',
                paddingLeft: '4px',
              }}
            >
              Platform
            </div>
            {[
              { label: 'Discover', href: '/discover' },
              { label: 'About Carcblog', href: '/about' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobileDrawer}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '48px',
                  padding: '0 4px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--color-hairline)', marginBottom: '24px' }} />

          {/* ── ZONE 5 (END): Account / Profile Card (Placed at the end as requested) ── */}
          {isAuthenticated ? (
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-hairline)',
                padding: '16px',
                marginTop: '8px',
              }}
            >
              {/* Identity Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--color-canvas)',
                    border: '1px solid var(--color-hairline-strong)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || 'User'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)' }}>
                      {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--color-ink-strong)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user?.full_name || user?.username || 'Account'}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      color: 'var(--color-stone)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 700,
                      marginTop: '2px',
                    }}
                  >
                    {userRole} ROLE
                  </div>
                </div>
                {/* Accordion toggle */}
                <button
                  onClick={() => setMobileAccountOpen((v) => !v)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--color-canvas)',
                    border: '1px solid var(--color-hairline)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-ink)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Account</span>
                  <ChevronDown
                    style={{
                      width: '13px',
                      height: '13px',
                      transform: mobileAccountOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 150ms ease',
                    }}
                  />
                </button>
              </div>

              {/* Expandable Account Quick Links */}
              {mobileAccountOpen && (
                <div
                  style={{
                    marginTop: '14px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--color-hairline)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    animation: 'mobileAccordionIn 180ms ease',
                  }}
                >
                  {menuItems.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileDrawer}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          minHeight: '44px',
                          padding: '0 10px',
                          borderRadius: 'var(--radius-md)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'var(--color-steel)',
                          textDecoration: 'none',
                          background: pathname === item.href ? 'var(--color-canvas)' : 'transparent',
                        }}
                      >
                        <ItemIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                  <div style={{ height: '1px', background: 'var(--color-hairline)', margin: '6px 0' }} />
                  <a
                    href="/api/auth/signout"
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      minHeight: '44px',
                      padding: '0 10px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#dc2626',
                      textDecoration: 'none',
                    }}
                  >
                    <LogOut style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                    <span>Sign Out</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '8px',
              }}
            >
              <a
                href="/auth/sign-in"
                onClick={closeMobileDrawer}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '44px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--color-hairline-strong)',
                  background: 'transparent',
                  color: 'var(--color-ink)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Sign in
              </a>
              <a
                href="/auth/sign-up"
                onClick={closeMobileDrawer}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '44px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Get started
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  ) : null;

  const DrawerPortal = isMounted
    ? createPortal(mobileDrawerContent, document.body)
    : null;

  return (
    <>
    <header ref={headerRef} style={S.header} role="banner">
      <div style={S.inner}>

        {/* ── LEFT: Clean Wordmark ── */}
        <div style={S.left}>
          <a href="/" style={S.logo} aria-label="Carcblog home">
            Carcblog
          </a>
        </div>

        {/* ── CENTER: Primary Navigation Links (desktop only ≥1024px) ── */}
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

        {/* ── RIGHT: Desktop Controls & Mobile Close/Menu Button ── */}
        <div style={S.right}>

          {/* Search Trigger Pill (desktop only ≥1024px) */}
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

          {/* Desktop Auth Controls (desktop only ≥1024px) */}
          <div ref={avatarRef} style={{ position: 'relative' }} className="nav-desktop-auth">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setAvatarOpen((prev) => !prev)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--color-hairline-strong)',
                    background: 'var(--color-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    padding: 0,
                    boxShadow: 'var(--shadow-subtle)',
                    transition: 'transform 150ms ease, border-color 150ms ease',
                  }}
                  aria-label="User Account Menu"
                  aria-expanded={avatarOpen}
                  title="Account Menu"
                >
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-sans)', color: '#ffffff', letterSpacing: '-0.02em' }}>
                      {(user?.full_name || user?.username || 'U').trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {avatarOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 10px)',
                      width: '230px',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--color-hairline)',
                      background: '#ffffff',
                      padding: '8px',
                      boxShadow: 'var(--shadow-modal)',
                      zIndex: 1000,
                      animation: 'mobileAccordionIn 150ms ease',
                    }}
                  >
                    <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--color-hairline-soft)', marginBottom: '6px' }}>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 700, color: 'var(--color-ink-strong)' }}>
                        {user?.full_name || user?.username || 'Writer'}
                      </div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-steel)', fontWeight: 500, marginTop: '2px' }}>
                        {(userRole || 'USER').toUpperCase()}
                      </div>
                    </div>

                    <a
                      href="/dashboard/profile"
                      onClick={() => setAvatarOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--color-ink)',
                        textDecoration: 'none',
                        transition: 'background 120ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <User size={16} style={{ color: 'var(--color-steel)' }} />
                      Profile
                    </a>

                    <a
                      href="/dashboard/settings"
                      onClick={() => setAvatarOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--color-ink)',
                        textDecoration: 'none',
                        transition: 'background 120ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Settings size={16} style={{ color: 'var(--color-steel)' }} />
                      Settings
                    </a>

                    <button
                      onClick={() => {
                        setAvatarOpen(false);
                        if (typeof window !== 'undefined' && (window as any).Clerk) {
                          (window as any).Clerk.signOut(() => { window.location.href = '/'; });
                        } else {
                          window.location.href = '/auth/sign-in';
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        width: '100%',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#DC2626',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 120ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut size={16} style={{ color: '#DC2626' }} />
                      Sign out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href="/auth/sign-in"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '36px',
                    padding: '0 16px',
                    borderRadius: 'var(--radius-pill)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-ink)',
                    textDecoration: 'none',
                    border: '1px solid var(--color-hairline-strong)',
                    background: 'transparent',
                    transition: 'all 150ms ease',
                  }}
                >
                  Sign in
                </a>
                <a
                  href="/auth/sign-up"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '36px',
                    padding: '0 16px',
                    borderRadius: 'var(--radius-pill)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#ffffff',
                    textDecoration: 'none',
                    background: 'var(--color-primary)',
                    border: 'none',
                    transition: 'all 150ms ease',
                  }}
                >
                  Get started
                </a>
              </div>
            )}
          </div>

          {/* ── MOBILE TOGGLE BUTTON (Mobile <1024px) ── */}
          {/* Minimal single button on top-right: Menu icon (☰) when closed, Close icon (X) when open */}
          <button
            className="nav-mobile-toggle-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            style={S.mobileToggleBtn}
          >
            {mobileOpen ? (
              <X style={{ width: '22px', height: '22px', color: 'var(--color-ink)' }} />
            ) : (
              <Menu style={{ width: '22px', height: '22px', color: 'var(--color-ink)' }} />
            )}
          </button>
        </div>
      </div>

      {/* ── Responsive CSS ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Mobile-first (max 1024px): show mobile toggle button, hide desktop elements ── */
        .nav-center-desktop { display: none !important; }
        .nav-search-pill    { display: none !important; }
        .nav-desktop-auth   { display: none !important; }
        .nav-mobile-toggle-btn { display: inline-flex !important; }

        /* ── Desktop (min 1024px): show full desktop nav, hide mobile toggle ── */
        @media (min-width: 1024px) {
          .nav-center-desktop { display: flex !important; }
          .nav-search-pill    { display: inline-flex !important; }
          .nav-desktop-auth   { display: flex !important; }
          .nav-mobile-toggle-btn { display: none !important; }
        }

        /* ── Mobile drawer animations ── */
        @keyframes mobileDrawerIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mobileBackdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes mobileAccordionIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Respect reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          @keyframes mobileDrawerIn    { from { opacity: 0; } to { opacity: 1; } }
          @keyframes mobileBackdropIn  { from { opacity: 0; } to { opacity: 1; } }
          @keyframes mobileAccordionIn { from { opacity: 0; } to { opacity: 1; } }
        }
      ` }} />

    </header>
    {DrawerPortal}
    </>
  );
}

export default Navbar;

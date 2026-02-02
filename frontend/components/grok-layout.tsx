'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, SquarePen, AlignLeft, Clock, UserCircle, LogOut, X, Home, Settings, CreditCard } from 'lucide-react';
import { DeepDraftBanner } from '@/components/deepdraft-banner';
import { cn } from '@/lib/utils';
import { LogoSliced } from '@/components/logo-sliced';
import { useAuth } from '@/lib/auth-context';
import { getAllIdeasFromStorage } from '@/lib/ideas-local';

interface GrokLayoutProps {
  children: ReactNode;
}

type PanelType = 'search' | 'library' | 'history' | null;

interface IdeaListItem {
  id: string;
  idea: string;
  tier: string;
  createdAt: string;
}

export function GrokLayout({ children }: GrokLayoutProps) {
  const [openPanel, setOpenPanel] = useState<PanelType>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<IdeaListItem[]>([]);
  const [libraryItems, setLibraryItems] = useState<IdeaListItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [profileMenuOpen]);

  useEffect(() => {
    if (openPanel !== 'history') return;

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        if (user) {
          const res = await fetch('/api/ideas');
          const json = await res.json();
          setHistoryItems(json.success && json.data ? json.data : []);
        } else {
          setHistoryItems(getAllIdeasFromStorage());
        }
      } catch {
        setHistoryItems([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [openPanel, user]);

  useEffect(() => {
    if (openPanel !== 'library') return;

    const loadLibrary = async () => {
      setLibraryLoading(true);
      try {
        if (user) {
          const res = await fetch('/api/ideas');
          const json = await res.json();
          setLibraryItems(json.success && json.data ? json.data : []);
        } else {
          setLibraryItems(getAllIdeasFromStorage());
        }
      } catch {
        setLibraryItems([]);
      } finally {
        setLibraryLoading(false);
      }
    };

    loadLibrary();
  }, [openPanel, user]);

  const handlePanelToggle = (panel: PanelType) => {
    setOpenPanel(openPanel === panel ? null : panel);
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground relative overflow-hidden">
      {/* Background - grid only */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grok-blueprint-micro" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <pattern id="grok-blueprint-macro" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="url(#grok-blueprint-micro)" />
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grok-blueprint-macro)" className="text-foreground opacity-[0.06] dark:opacity-[0.05]" />
        </svg>
      </div>

      {/* Sidebar - compact */}
      <aside className="relative z-10 w-11 flex flex-col items-center py-2 hidden md:flex border-r border-border/50">
        <Link href="/" className="mb-2 p-0.5">
          <LogoSliced className="w-7 h-7" />
        </Link>
        <nav className="flex flex-col gap-0.5">
          <button
            onClick={() => handlePanelToggle('search')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              "hover:bg-secondary/80 dark:hover:bg-secondary/40",
              openPanel === 'search' ? "bg-secondary/80 dark:bg-secondary/40 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link
            href="/"
            className={cn(
              "p-1.5 rounded-md transition-colors",
              "hover:bg-secondary/80 dark:hover:bg-secondary/40",
              "text-muted-foreground hover:text-foreground"
            )}
            title="New Chat"
          >
            <SquarePen className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handlePanelToggle('library')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              "hover:bg-secondary/80 dark:hover:bg-secondary/40",
              openPanel === 'library' ? "bg-secondary/80 dark:bg-secondary/40 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Library"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handlePanelToggle('history')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              "hover:bg-secondary/80 dark:hover:bg-secondary/40",
              openPanel === 'history' ? "bg-secondary/80 dark:bg-secondary/40 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="History"
          >
            <Clock className="h-4 w-4" />
          </button>
        </nav>
        {user && (
          <div className="mt-auto flex flex-col gap-0.5 relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              title="Profile"
              className={cn(
                "p-1.5 rounded-md transition-colors",
                "hover:bg-secondary/80 dark:hover:bg-secondary/40",
                profileMenuOpen ? "bg-secondary/80 dark:bg-secondary/40 text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserCircle className="h-4 w-4" />
            </button>
            {profileMenuOpen && (
              <div className="absolute bottom-full left-0 mb-1.5 w-40 py-1.5 bg-white dark:bg-zinc-900 border border-border/50 rounded-lg shadow-xl z-50">
                <Link
                  href="/"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <Home className="h-3.5 w-3.5" />
                  홈으로 가기
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  설정
                </Link>
                <Link
                  href="/upgrade"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Upgrade
                </Link>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary/50 transition-colors text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="absolute top-0 right-0 p-3 flex justify-end items-center z-10 gap-1">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={user.email}>
                {user.email}
              </span>
              <button
                onClick={() => signOut()}
                title="로그아웃"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full hover:bg-secondary/80 dark:hover:bg-secondary/40 transition-colors text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                title="Sign in"
                className="inline-flex items-center justify-center h-8 min-w-[72px] px-4 text-sm rounded-full font-medium leading-none transition-colors bg-white text-black border border-black/20 hover:opacity-90 dark:bg-black dark:text-white dark:border-white/20"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                title="Sign up"
                className="inline-flex items-center justify-center h-8 min-w-[72px] px-4 text-sm rounded-full font-medium leading-none transition-colors bg-black text-white hover:opacity-90 dark:bg-white dark:text-black"
              >
                Sign up
              </Link>
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <div className="w-full max-w-3xl -mt-10">
            {children}
          </div>
        </div>

        {/* Side Panel */}
        {openPanel && (
          <>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm z-20"
              onClick={() => setOpenPanel(null)}
            />

            {/* Panel */}
            <div className="absolute top-0 right-0 h-full w-96 bg-background border-l border-border/50 z-30 shadow-2xl">
              <div className="flex flex-col h-full">
                {/* Panel Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <h2 className="text-lg font-semibold">
                    {openPanel === 'search' && 'Search'}
                    {openPanel === 'library' && 'Library'}
                    {openPanel === 'history' && 'History'}
                  </h2>
                  <button
                    onClick={() => setOpenPanel(null)}
                    className="p-2 rounded-lg hover:bg-secondary/80 dark:hover:bg-secondary/40 transition-colors"
                    aria-label="닫기"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-auto p-4">
                  {openPanel === 'search' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-full px-4 py-2 rounded-lg border border-border/50 bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <div className="text-sm text-muted-foreground text-center py-8">
                        Search results will appear here
                      </div>
                    </div>
                  )}

                  {openPanel === 'library' && (
                    <div className="space-y-3">
                      {libraryLoading ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                          로딩 중...
                        </div>
                      ) : libraryItems.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                          저장한 아이디어가 없어요
                        </div>
                      ) : (
                        <ul className="space-y-1">
                          {libraryItems.map((item) => (
                            <li key={item.id}>
                              <Link
                                href={`/ideas/${item.id}`}
                                onClick={() => setOpenPanel(null)}
                                className="block px-3 py-2 rounded-lg hover:bg-secondary/50 text-sm text-foreground truncate"
                              >
                                {item.idea || '(제목 없음)'}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {openPanel === 'history' && (
                    <div className="space-y-3">
                      {historyLoading ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                          로딩 중...
                        </div>
                      ) : historyItems.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                          아직 아이디어가 없어요
                        </div>
                      ) : (
                        <ul className="space-y-1">
                          {historyItems.map((item) => (
                            <li key={item.id}>
                              <Link
                                href={`/ideas/${item.id}`}
                                onClick={() => setOpenPanel(null)}
                                className="block px-3 py-2 rounded-lg hover:bg-secondary/50 text-sm text-foreground truncate"
                              >
                                {item.idea || '(제목 없음)'}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* DeepDraft Promotional Banner */}
      {!user && <DeepDraftBanner />}
    </div>
  );
}

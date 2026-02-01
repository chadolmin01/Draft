'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { Search, SquarePen, AlignLeft, Clock, UserCircle, LogIn, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoSliced } from '@/components/logo-sliced';
import { useAuth } from '@/lib/auth-context';

interface GrokLayoutProps {
  children: ReactNode;
}

type PanelType = 'search' | 'library' | 'history' | null;

export function GrokLayout({ children }: GrokLayoutProps) {
  const [openPanel, setOpenPanel] = useState<PanelType>(null);
  const { user, signOut } = useAuth();

  const handlePanelToggle = (panel: PanelType) => {
    setOpenPanel(openPanel === panel ? null : panel);
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-14 flex-col items-center py-3 hidden md:flex border-r border-border/50">
        <Link href="/" className="mb-4 p-1">
          <LogoSliced className="w-9 h-9" />
        </Link>
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => handlePanelToggle('search')}
            className={cn(
              "p-2.5 rounded-lg transition-colors",
              "hover:bg-secondary/80 dark:hover:bg-secondary/40",
              openPanel === 'search' ? "bg-secondary/80 dark:bg-secondary/40 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/"
            className={cn(
              "p-2.5 rounded-lg transition-colors",
              "hover:bg-secondary/80 dark:hover:bg-secondary/40",
              "text-muted-foreground hover:text-foreground"
            )}
            title="New Chat"
          >
            <SquarePen className="h-5 w-5" />
          </Link>
          <button
            onClick={() => handlePanelToggle('library')}
            className={cn(
              "p-2.5 rounded-lg transition-colors",
              "hover:bg-secondary/80 dark:hover:bg-secondary/40",
              openPanel === 'library' ? "bg-secondary/80 dark:bg-secondary/40 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Library"
          >
            <AlignLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => handlePanelToggle('history')}
            className={cn(
              "p-2.5 rounded-lg transition-colors",
              "hover:bg-secondary/80 dark:hover:bg-secondary/40",
              openPanel === 'history' ? "bg-secondary/80 dark:bg-secondary/40 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="History"
          >
            <Clock className="h-5 w-5" />
          </button>
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <button title="Profile" className="p-2.5 rounded-lg hover:bg-secondary/80 dark:hover:bg-secondary/40 text-muted-foreground hover:text-foreground">
            <UserCircle className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
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
            <Link
              href="/login"
              title="Login"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full hover:bg-secondary/80 dark:hover:bg-secondary/40 transition-colors text-muted-foreground hover:text-foreground"
            >
              <LogIn className="h-4 w-4" />
              <span className="font-medium">Login</span>
            </Link>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
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
                    <div className="text-sm text-muted-foreground text-center py-8">
                      Your saved items will appear here
                    </div>
                  )}

                  {openPanel === 'history' && (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      Your search history will appear here
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

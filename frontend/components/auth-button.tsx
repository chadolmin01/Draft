'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/auth-dialog';
import { UserCircle, LogOut } from 'lucide-react';

export function AuthButton() {
  const { user, loading, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-secondary/50" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="max-w-[120px] truncate text-xs text-muted-foreground">
          {user.email}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut()}
          className="h-8 w-8"
          title="로그아웃"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setAuthOpen(true)}
        className="h-8 w-8 opacity-60 hover:opacity-100 transition-opacity"
        title="로그인"
      >
        <UserCircle className="h-5 w-5" />
      </Button>
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { DraftLogo } from '@/components/draft-logo';
import { AuthDialog } from '@/components/auth-dialog';
import { DeepDraftBanner } from '@/components/deepdraft-banner';
import { useAuth } from '@/lib/auth-context';
import { Mail, ChevronDown } from 'lucide-react';

// 모노톤 브랜드 아이콘 (Google, Apple)
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function LoginPage() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { user, signInWithOAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    const { error } = await signInWithOAuth(provider);
    if (error) {
      console.error('OAuth error:', error);
      // TODO: toast 또는 에러 UI 표시
    }
    // 성공 시 Supabase가 OAuth 페이지로 리다이렉트
  };

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      {/* --- Left Side: Login Form --- */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full md:w-1/2 flex flex-col justify-between px-3 pt-3 pb-6 md:px-4 md:pt-4 md:pb-8 lg:px-5 lg:pt-5 lg:pb-12 relative bg-background text-foreground"
      >
        {/* Top Header - logo & pill pushed towards top */}
        <div className="flex justify-between items-start">
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <DraftLogo className="w-7 h-7 md:w-8 md:h-8 text-foreground" />
          </Link>

          {/* "You are signing into..." Pill */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/60 rounded-xl text-xs font-medium text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors">
            You are signing into <span className="font-medium text-foreground flex items-center gap-1"><DraftLogo className="w-2.5 h-2.5" /> Draft</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main Center Content */}
        <div className="flex flex-col items-stretch w-full max-w-lg mx-auto space-y-6 mt-16 mb-10 px-2 md:px-0">

          <div className="text-center space-y-1">
            <h1 className="text-xl md:text-2xl font-medium tracking-tight text-foreground">
              Log into your account
            </h1>
          </div>

          {/* Button Stack - 30% narrower (70% width) */}
          <div className="w-[70%] min-w-[200px] mx-auto space-y-2">
            {/* Primary Button */}
            <button className="w-full h-9 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 text-sm hover:opacity-90 transition-opacity">
              <DraftLogo className="w-4 h-4" />
              <span>Login with Draft</span>
            </button>

            {/* Divider */}
            <div className="relative py-1.5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
            </div>

            {/* Secondary Buttons */}
            <button
              type="button"
              onClick={() => setAuthDialogOpen(true)}
              className="w-full h-9 rounded-xl bg-background border border-slate-300 dark:border-slate-600 text-foreground font-medium flex items-center justify-center gap-2 text-sm hover:bg-secondary/40 transition-colors"
            >
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>Login with email</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="w-full h-9 rounded-xl bg-background border border-slate-300 dark:border-slate-600 text-foreground font-medium flex items-center justify-center gap-2 text-sm hover:bg-secondary/40 transition-colors"
            >
              <GoogleIcon className="w-4 h-4 text-muted-foreground" />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className="w-full h-9 rounded-xl bg-background border border-slate-300 dark:border-slate-600 text-foreground font-medium flex items-center justify-center gap-2 text-sm hover:bg-secondary/40 transition-colors"
            >
              <GitHubIcon className="w-4 h-4 text-muted-foreground" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Last logged in hint */}
          <p className="text-center text-xs text-muted-foreground">
            You last logged in with Google
          </p>

          <div className="text-center text-xs">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/signup" className="font-medium text-foreground hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* Footer - pushed to bottom, center-aligned */}
        <div className="text-center text-[11px] text-muted-foreground pt-8 pb-4">
          By continuing, you agree to Draft&apos;s <Link href="#" className="underline hover:text-foreground">Terms of Service</Link> and <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>.
        </div>
      </motion.div>

      {/* --- Right Side: Subtle Architectural Atmosphere (No Hologram) --- */}
      <div className="hidden md:flex w-1/2 bg-black relative overflow-hidden items-center justify-center">
        {/* 1. Deep Background Gradient (Soft Spotlight) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1e293b_0%,_#000000_100%)] opacity-60" />

        {/* 2. Scanning Light Beam (Subtle Animation) */}
        <motion.div
          animate={{ top: ['0%', '100%', '0%'], opacity: [0, 0.15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-100 to-transparent blur-[1px] z-10 w-full"
        />

        {/* 3. Background Grid Texture Only */}
        <div className="relative z-0 w-full h-full opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="blueprint-microGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.1" />
              </pattern>
              <pattern id="blueprint-macroGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#blueprint-microGrid)" />
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" strokeWidth="0.8" opacity="0.15" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#blueprint-macroGrid)" />
          </svg>
        </div>

        {/* 4. Minimal System Status Text */}
        <div className="absolute bottom-12 right-12 text-[10px] font-mono text-slate-600 tracking-widest opacity-40">
          SYSTEM_READY // SECURE_CONNECTION
        </div>

        {/* 5. Vignette Overlay (Dark Edges) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] pointer-events-none" />
      </div>

      {/* Email Login Modal */}
      <AuthDialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />

      {/* DeepDraft Banner */}
      <DeepDraftBanner />
    </div>
  );
}

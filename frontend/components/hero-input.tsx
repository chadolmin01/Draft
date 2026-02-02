'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Send, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tier } from '@/lib/types';

interface HeroInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string, tier: Tier) => void;
  placeholder?: string;
  disabled?: boolean;
  tier: Tier;
  onTierChange: (tier: Tier) => void;
  className?: string;
  /** 비로그인 시 Pro/Heavy 비활성화 */
  isLoggedIn?: boolean;
  /** true면 티어 선택 비활성화 (계정 티어 사용) */
  tierReadOnly?: boolean;
}

export function HeroInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
  tier,
  onTierChange,
  className,
  isLoggedIn = true,
  tierReadOnly = false,
}: HeroInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTierOpen, setIsTierOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Auto-resize logic (Simplified for single line focus but expandable)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 24), 200); // Min 24px, Max 200px
    textarea.style.height = `${newHeight}px`;
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSubmit(value, tier);
  };

  const tiers: { value: Tier; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'pro', label: 'Pro' },
    { value: 'heavy', label: 'Heavy' },
  ];

  return (
    <div className={cn("relative w-full", className)}>
      <div className={cn(
        "flex items-center w-full bg-secondary/40 dark:bg-secondary/15 backdrop-blur-sm border border-border/40 rounded-full px-4 py-1.5 transition-all duration-300 focus-within:border-primary/40 focus-within:bg-background/80 focus-within:shadow-sm",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent border-none outline-none focus:ring-0 resize-none max-h-[200px] py-1.5 px-2 text-sm placeholder:text-muted-foreground font-sans"
          placeholder={placeholder || "How can I help you today?"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={disabled}
          rows={1}
        />

        {/* Tier Selector & Send/Mic Buttons */}
        <div className="flex items-center gap-1.5">
           {/* Tier Selector (Dropdown) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => !disabled && !tierReadOnly && setIsTierOpen(!isTierOpen)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                !tierReadOnly && "hover:bg-secondary/80 dark:hover:bg-secondary/40",
                isTierOpen ? "bg-secondary/80 dark:bg-secondary/40 text-foreground" : "text-muted-foreground",
                tierReadOnly && "cursor-default"
              )}
              disabled={disabled}
              title={tierReadOnly ? '계정 플랜 (결제로 업그레이드)' : undefined}
            >
              {tiers.find(t => t.value === tier)?.label || 'Expert'}
              {!tierReadOnly && <ChevronDown className="w-3 h-3" />}
            </button>
            {isTierOpen && (
              <div className="absolute top-full mt-2 right-0 w-28 bg-popover border border-border/60 rounded-lg shadow-lg py-1 z-50">
                {tiers.map((t) => {
                  const isLocked = !isLoggedIn && (t.value === 'pro' || t.value === 'heavy');
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        if (isLocked) {
                          setIsTierOpen(false);
                          setShowLoginPrompt(true);
                          return;
                        }
                        onTierChange(t.value);
                        setIsTierOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-xs transition-colors",
                        isLocked && "opacity-60 cursor-not-allowed",
                        !isLocked && "hover:bg-secondary/50",
                        tier === t.value ? "text-foreground font-medium" : "text-muted-foreground"
                      )}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            )}
            {showLoginPrompt && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLoginPrompt(false)} />
                <div className="absolute top-full mt-2 right-0 w-64 p-3 bg-popover border border-border/60 rounded-lg shadow-lg z-50 text-xs text-muted-foreground">
                  로그인하면 Pro/Heavy를 사용할 수 있어요
                  <Link href="/login" className="block mt-2 text-primary font-medium hover:underline" onClick={() => setShowLoginPrompt(false)}>
                    로그인하기 →
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            title="제출"
            aria-label="제출"
            className={cn(
              "p-1.5 rounded-full transition-all duration-200",
              value.trim() && !disabled
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-secondary/40 text-muted-foreground cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

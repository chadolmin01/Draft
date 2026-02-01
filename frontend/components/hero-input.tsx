'use client';

import { useRef, useEffect, useState } from 'react';
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
}

export function HeroInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
  tier,
  onTierChange,
  className
}: HeroInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTierOpen, setIsTierOpen] = useState(false);

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
              onClick={() => !disabled && setIsTierOpen(!isTierOpen)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                "hover:bg-secondary/80 dark:hover:bg-secondary/40",
                isTierOpen ? "bg-secondary/80 dark:bg-secondary/40 text-foreground" : "text-muted-foreground"
              )}
              disabled={disabled}
            >
              {tiers.find(t => t.value === tier)?.label || 'Expert'}
              <ChevronDown className="w-3 h-3" />
            </button>
            {isTierOpen && (
              <div className="absolute top-full mt-2 right-0 w-28 bg-popover border border-border/60 rounded-lg shadow-lg py-1 z-50">
                {tiers.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      onTierChange(t.value);
                      setIsTierOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-secondary/50",
                      tier === t.value ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
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

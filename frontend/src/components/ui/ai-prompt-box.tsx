"use client";

import React, { useRef, useEffect } from "react";

interface AIPromptBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function AIPromptBox({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Ask Hermes...",
}: AIPromptBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <div className="w-full bg-[#0C0C0E] border border-zinc-800/40 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-[#F59E0B]/70 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.08)] rounded-2xl transition-all duration-200 relative group">
      <form onSubmit={onSubmit} className="flex items-end gap-3 p-3 select-none">
        {/* Input Text Area */}
        <div className="flex-1 flex items-center">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-white font-mono text-xs outline-none border-none resize-none placeholder-zinc-500 disabled:opacity-50 min-h-[24px] max-h-[180px] leading-relaxed self-center py-1 select-text"
          />
        </div>

        {/* Minimalist Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className={`p-2.5 rounded-xl btn-tactile shrink-0 cursor-pointer self-end ${
            isLoading || !value.trim()
              ? "bg-zinc-800/40 text-zinc-600 cursor-not-allowed opacity-55"
              : "bg-amber-500 text-black hover:bg-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)]"
          }`}
          title="Send command"
        >
          {isLoading ? (
            <svg className="animate-spin-fast h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

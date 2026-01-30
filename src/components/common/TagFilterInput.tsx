// src/components/common/TagFilterInput.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Simple TagIcon and XIcon
const TagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tag">
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414L10.586 22a2 2 0 0 0 2.828 0l8.172-8.172a2 2 0 0 0 0-2.828L12.586 2.586Z"/><path d="M7 7h.01"/>
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

interface TagFilterInputProps {
  initialTag?: string;
  debounceTime?: number; // Milliseconds to debounce
}

export function TagFilterInput({ initialTag = "", debounceTime = 300 }: TagFilterInputProps) {
  const [tagTerm, setTagTerm] = useState(initialTag);
  const debouncedTagTerm = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debouncedTagTerm.current === null) return;

    const currentUrl = new URL(window.location.href);
    if (debouncedTagTerm.current) {
      currentUrl.searchParams.set("tag", debouncedTagTerm.current);
    } else {
      currentUrl.searchParams.delete("tag");
    }
    window.history.pushState({}, "", currentUrl.toString());
  }, [debouncedTagTerm.current]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTagTerm = event.target.value;
    setTagTerm(newTagTerm);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      debouncedTagTerm.current = newTagTerm;
    }, debounceTime);
  };

  const handleClear = () => {
    setTagTerm("");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    debouncedTagTerm.current = "";
  };

  return (
    <div className="relative w-full max-w-md">
      <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Filter by tag..."
        value={tagTerm}
        onChange={handleInputChange}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          "pl-9 pr-8" // Padding for icon and clear button
        )}
      />
      {tagTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 p-1 rounded-full text-muted-foreground hover:bg-muted"
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// src/components/common/SearchInput.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils"; // Assuming cn for class merging

// Simple SearchIcon and XIcon
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

interface SearchInputProps {
  initialSearch?: string;
  debounceTime?: number; // Milliseconds to debounce
}

export function SearchInput({ initialSearch = "", debounceTime = 300 }: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const debouncedSearchTerm = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to update URL when debouncedSearchTerm changes
  useEffect(() => {
    if (debouncedSearchTerm.current === null) return; // Skip initial run

    const currentUrl = new URL(window.location.href);
    if (debouncedSearchTerm.current) {
      currentUrl.searchParams.set("search", debouncedSearchTerm.current);
    } else {
      currentUrl.searchParams.delete("search");
    }
    window.history.pushState({}, "", currentUrl.toString());
    // Trigger a soft navigation or re-fetch in Astro if needed,
    // For now, Astro pages will re-render on URL changes
  }, [debouncedSearchTerm.current]); // Re-run effect when debounced value changes

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      debouncedSearchTerm.current = newSearchTerm;
    }, debounceTime);
  };

  const handleClear = () => {
    setSearchTerm("");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    debouncedSearchTerm.current = "";
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Search prompts..."
        value={searchTerm}
        onChange={handleInputChange}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          "px-3 py-1" // Adjusted padding since icons are removed
        )}
      />
    </div>
  );
}

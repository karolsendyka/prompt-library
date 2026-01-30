// src/components/common/SortControls.tsx
"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ListPromptsQuery } from "@/lib/services/prompt.service";

interface SortControlsProps {
  initialSortBy?: ListPromptsQuery["sortBy"];
  initialOrder?: ListPromptsQuery["order"];
}

export function SortControls({
  initialSortBy = "created_at",
  initialOrder = "desc",
}: SortControlsProps) {
  const [sortBy, setSortBy] = useState<ListPromptsQuery["sortBy"]>(initialSortBy);
  const [order, setOrder] = useState<ListPromptsQuery["order"]>(initialOrder);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("sortBy", sortBy);
    currentUrl.searchParams.set("order", order);
    window.history.pushState({}, "", currentUrl.toString());
  }, [sortBy, order]);

  const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as ListPromptsQuery["sortBy"]);
  };

  const handleOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOrder(event.target.value as ListPromptsQuery["order"]);
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={sortBy}
        onChange={handleSortByChange}
        className={cn(
          "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        )}
      >
        <option value="created_at">Date Created</option>
        <option value="updated_at">Date Updated</option>
        <option value="vote_score">Vote Score</option>
      </select>
      <select
        value={order}
        onChange={handleOrderChange}
        className={cn(
          "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        )}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
}

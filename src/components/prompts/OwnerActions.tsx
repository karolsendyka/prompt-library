// src/components/prompts/OwnerActions.tsx
"use client";
import React, { useState } from 'react';
import { cn } from "@/lib/utils"; // Assuming cn for class merging

interface OwnerActionsProps {
  promptId: string;
}

export function OwnerActions({ promptId }: OwnerActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    if (!window.confirm("Are you sure you want to delete this prompt? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete prompt.");
      }

      // Redirect to the prompt list page
      window.location.href = "/list";
    } catch (error) {
      console.error("Delete failed:", error);
      setIsDeleting(false); // Re-enable button
      // TODO: Show a proper toast notification here
      alert("Failed to delete prompt. Please try again."); // Simple alert for now
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <a
        href={`/prompts/${promptId}/edit`}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
          "transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2" // Mimic shadcn button style
        )}
      >
        Edit
      </a>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
          "transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 h-9 px-4 py-2", // Mimic shadcn button style for destructive action
          isDeleting && "opacity-50 cursor-not-allowed"
        )}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}

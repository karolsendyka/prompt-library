// src/components/prompts/VoteControl.tsx
"use client";
import React, { useState } from 'react';
import { cn } from "@/lib/utils"; // Assuming cn for class merging

// Define props for upvote/downvote icons (simplified for now)
const UpvoteIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up">
    <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
  </svg>
);

const DownvoteIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down">
    <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
  </svg>
);

interface VoteControlProps {
  promptId: string;
  initialScore: number;
  initialUserVote: -1 | 0 | 1;
  className?: string; // Add className prop
}

export function VoteControl({ promptId, initialScore, initialUserVote, className }: VoteControlProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [loading, setLoading] = useState(false);

  const handleVote = async (newVoteValue: -1 | 0 | 1) => {
    if (loading) return;

    setLoading(true);

    const previousScore = score;
    const previousUserVote = userVote;

    // Optimistic UI Update
    setScore(score + (newVoteValue - userVote));
    setUserVote(newVoteValue);

    try {
      const response = await fetch(`/api/prompts/${promptId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vote_value: newVoteValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit vote.");
      }

      const data = await response.json();
      setScore(data.new_vote_score); // Update with actual score from server

    } catch (error) {
      console.error("Voting failed:", error);
      // Revert UI on error
      setScore(previousScore);
      setUserVote(previousUserVote);
      // TODO: Show a proper toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = () => {
    if (userVote === 1) {
      // If already upvoted, remove vote (set to 0)
      handleVote(0);
    } else {
      // Upvote
      handleVote(1);
    }
  };

  const handleDownvote = () => {
    if (userVote === -1) {
      // If already downvoted, remove vote (set to 0)
      handleVote(0);
    } else {
      // Downvote
      handleVote(-1);
    }
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <button
        onClick={handleUpvote}
        disabled={loading}
        className={cn(
          "p-1 rounded-md transition-colors",
          userVote === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
        )}
      >
        <UpvoteIcon className="w-5 h-5" />
      </button>
      <span className="font-semibold text-lg min-w-[30px] text-center">{score}</span>
      <button
        onClick={handleDownvote}
        disabled={loading}
        className={cn(
          "p-1 rounded-md transition-colors",
          userVote === -1 ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-muted"
        )}
      >
        <DownvoteIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

// src/components/prompts/PromptForm.tsx
"use client";
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { z } from "zod";
import type { CreatePromptCommand } from "@/types"; // Import the type for validation

// Define form schema using zod
const promptFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  content: z.string().min(1, { message: "Content is required." }),
  tags: z.string().optional(), // Comma-separated string for now
});

type PromptFormValues = z.infer<typeof promptFormSchema>;

export function PromptForm() {
  const [formValues, setFormValues] = useState<PromptFormValues>({
    title: "",
    description: "",
    content: "",
    tags: "",
  });
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    const result = promptFormSchema.safeParse(formValues);

    if (!result.success) {
      setErrors(result.error.issues);
      setIsSubmitting(false);
      return;
    }

    // Prepare data for API
    const createCommand: CreatePromptCommand = {
      title: result.data.title,
      description: result.data.description,
      content: result.data.content,
      tags: result.data.tags ? result.data.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
    };

    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createCommand),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create prompt.");
      }

      const newPrompt = await response.json();
      console.log("Prompt created:", newPrompt);
      // Redirect to the new prompt's detail page
      window.location.href = `/prompts/${newPrompt.id}`;
    } catch (error: any) {
      console.error("Error creating prompt:", error);
      setErrors([{ path: ["general"], message: error.message || "An unexpected error occurred." }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorMessage = (path: string) => {
    return errors.find((err) => err.path[0] === path)?.message;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-card text-card-foreground shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center">Create New Prompt</h2>

      {errors.length > 0 && errors.some(err => err.path[0] === "general") && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {errors.find(err => err.path[0] === "general")?.message}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formValues.title}
          onChange={handleChange}
          className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", getErrorMessage("title") && "border-destructive")}
          disabled={isSubmitting}
        />
        {getErrorMessage("title") && <p className="text-destructive text-xs mt-1">{getErrorMessage("title")}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
        <textarea
          id="description"
          name="description"
          value={formValues.description}
          onChange={handleChange}
          rows={3}
          className={cn("flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", getErrorMessage("description") && "border-destructive")}
          disabled={isSubmitting}
        ></textarea>
        {getErrorMessage("description") && <p className="text-destructive text-xs mt-1">{getErrorMessage("description")}</p>}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">Prompt Content</label>
        <textarea
          id="content"
          name="content"
          value={formValues.content}
          onChange={handleChange}
          rows={10}
          className={cn("flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", getErrorMessage("content") && "border-destructive")}
          disabled={isSubmitting}
        ></textarea>
        {getErrorMessage("content") && <p className="text-destructive text-xs mt-1">{getErrorMessage("content")}</p>}
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formValues.tags}
          onChange={handleChange}
          className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", getErrorMessage("tags") && "border-destructive")}
          placeholder="e.g., react, javascript, frontend"
          disabled={isSubmitting}
        />
        {getErrorMessage("tags") && <p className="text-destructive text-xs mt-1">{getErrorMessage("tags")}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
          "transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 w-full",
          isSubmitting && "opacity-50 cursor-not-allowed"
        )}
      >
        {isSubmitting ? "Creating..." : "Create Prompt"}
      </button>
    </form>
  );
}

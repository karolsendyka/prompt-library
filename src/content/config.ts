import { defineCollection, z } from "astro:content";

const promptsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  prompts: promptsCollection,
};

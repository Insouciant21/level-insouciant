import { z } from "zod"

const slug = z.string().trim().min(1).max(250)
const text = z.string().trim().min(1)
const fields = {
  title: text.max(300),
  desc: text.max(5000),
  category: text.max(100),
  tags: z.array(text.max(100)).min(1).max(50),
  content: text.max(250_000).describe("Markdown article body"),
}
const target = {
  slug,
  version: z
    .uuid()
    .describe("Version returned by get_article or the preceding write"),
}
export const agentTools = {
  list_articles: {
    description: "List article titles, slugs, versions and draft status.",
    schema: z.strictObject({
      query: z.string().max(300).optional(),
      draft: z.boolean().optional(),
      offset: z.number().int().nonnegative().max(1_000_000).optional(),
    }),
  },
  list_tags: {
    description: "List existing article tags.",
    schema: z.strictObject({}),
  },
  get_article: {
    description: "Read the full article and its current version.",
    schema: z.strictObject({ slug }),
  },
  create_draft: {
    description:
      "Create a Markdown draft. Use a stable slug for retries. An existing slug is never overwritten.",
    schema: z.strictObject({
      slug: slug.regex(/^[\p{L}\p{N}]+(?:[-_][\p{L}\p{N}]+)*$/u),
      ...fields,
    }),
  },
  edit_article: {
    description:
      "Change only supplied fields. Supplying content replaces the entire body. Live edits require publish access.",
    schema: z.strictObject(fields).partial().extend(target),
  },
  publish_article: {
    description: "Publish a specific draft version.",
    schema: z.strictObject(target),
  },
  unpublish_article: {
    description: "Move a specific published version back to drafts.",
    schema: z.strictObject(target),
  },
}

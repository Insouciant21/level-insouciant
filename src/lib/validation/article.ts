import { z } from "zod"

const normalizedRequiredText = z.string().trim().min(1)

const normalizedTags = z
  .array(z.string())
  .transform((tags) => [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))])
  .refine((tags) => tags.length > 0, {
    message: "At least one tag is required",
  })

const validDate = z.string().trim().refine((value) => {
  return !Number.isNaN(new Date(value).getTime())
}, "Invalid date")

export const managedArticleInputSchema = z.object({
  title: normalizedRequiredText,
  desc: normalizedRequiredText,
  content: normalizedRequiredText,
  category: normalizedRequiredText,
  tags: normalizedTags,
  cover: z.string().trim(),
  publishedAt: validDate,
  draft: z.boolean(),
  slug: z.string().trim().default(""),
})

export type ManagedArticleInput = z.infer<typeof managedArticleInputSchema>

import { z } from "zod"

export const commentInputSchema = z.object({
  content: z
    .string()
    .transform((value) => value.trim().slice(0, 2_000))
    .refine((value) => value.length > 0, "Comment content is required"),
  parentId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => value || null),
})

export type CommentInput = z.infer<typeof commentInputSchema>

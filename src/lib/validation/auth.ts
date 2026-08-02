import { z } from "zod"

const normalizedEmail = z.string().trim().toLowerCase().min(1)
const nonEmptyPassword = z.string().refine((value) => value.trim().length > 0)

export const loginInputSchema = z.object({
  email: normalizedEmail,
  password: nonEmptyPassword,
})

export const registrationInputSchema = z.object({
  name: z
    .string()
    .trim()
    .transform((value) => value.slice(0, 60))
    .refine((value) => value.length > 0),
  email: normalizedEmail,
  password: z.string().min(8),
})

export const profileInputSchema = z.object({
  name: z.string().trim().transform((value) => value.slice(0, 60)),
  email: normalizedEmail,
  avatarUrl: z.string().trim(),
})

export const passwordChangeInputSchema = z
  .object({
    currentPassword: z.string().min(1),
    nextPassword: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((value) => value.nextPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

export type LoginInput = z.infer<typeof loginInputSchema>
export type RegistrationInput = z.infer<typeof registrationInputSchema>
export type ProfileInput = z.infer<typeof profileInputSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeInputSchema>

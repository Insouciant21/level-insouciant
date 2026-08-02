import { commentInputSchema, type CommentInput } from "@/lib/validation/comment"
import {
  managedArticleInputSchema,
  type ManagedArticleInput,
} from "@/lib/validation/article"
import {
  loginInputSchema,
  passwordChangeInputSchema,
  profileInputSchema,
  registrationInputSchema,
  type LoginInput,
  type PasswordChangeInput,
  type ProfileInput,
  type RegistrationInput,
} from "@/lib/validation/auth"

function getFormString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "")
}

function getFormTags(formData: FormData) {
  return getFormString(formData, "tags").split(/[\n,]/)
}

export function parseManagedArticleFormData(
  formData: FormData
): ManagedArticleInput {
  return managedArticleInputSchema.parse({
    slug: getFormString(formData, "slug"),
    title: getFormString(formData, "title"),
    desc: getFormString(formData, "desc"),
    category: getFormString(formData, "category"),
    tags: getFormTags(formData),
    cover: getFormString(formData, "cover"),
    publishedAt: getFormString(formData, "publishedAt"),
    content: getFormString(formData, "content"),
    draft: getFormString(formData, "intent").trim() !== "publish",
  })
}

export function parseLoginFormData(formData: FormData): LoginInput {
  return loginInputSchema.parse({
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password").trim(),
  })
}

export function parseRegistrationFormData(
  formData: FormData
): RegistrationInput {
  return registrationInputSchema.parse({
    name: getFormString(formData, "name"),
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password").trim(),
  })
}

export function parseProfileFormData(formData: FormData): ProfileInput {
  return profileInputSchema.parse({
    name: getFormString(formData, "name"),
    email: getFormString(formData, "email"),
    avatarUrl: getFormString(formData, "avatarUrl"),
  })
}

export function parsePasswordChangeFormData(
  formData: FormData
): PasswordChangeInput {
  return passwordChangeInputSchema.parse({
    currentPassword: getFormString(formData, "currentPassword").trim(),
    nextPassword: getFormString(formData, "nextPassword").trim(),
    confirmPassword: getFormString(formData, "confirmPassword").trim(),
  })
}

export function parseCommentRequestBody(value: unknown): CommentInput {
  return commentInputSchema.parse(value)
}

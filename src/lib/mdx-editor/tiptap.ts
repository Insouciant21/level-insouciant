import { FileHandler } from "@tiptap/extension-file-handler"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Mathematics from "@tiptap/extension-mathematics"
import { Markdown } from "@tiptap/markdown"
import type { AnyExtension } from "@tiptap/core"
import { TableKit } from "@tiptap/extension-table"
import StarterKit from "@tiptap/starter-kit"

export const ARTICLE_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

type ArticleEditorFileHandler = (files: File[], position?: number) => void

export function createArticleEditorExtensions(options: {
  onFiles: ArticleEditorFileHandler
}): AnyExtension[] {
  return [
    StarterKit.configure({ link: false }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
    }),
    Image.configure({
      allowBase64: false,
      inline: false,
    }),
    FileHandler.configure({
      allowedMimeTypes: [...ARTICLE_IMAGE_MIME_TYPES],
      consumePasteEvent: true,
      onPaste: (_editor, files) => options.onFiles(files),
      onDrop: (_editor, files, position) => options.onFiles(files, position),
    }),
    Mathematics.configure({
      katexOptions: {
        throwOnError: false,
      },
    }),
    TableKit,
    Markdown,
  ]
}

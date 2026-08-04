"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"

import {
  ArticleImageDialog,
  type ArticleImageDialogValue,
} from "@/components/admin/article-image-dialog"
import { ArticleEditorToolbar } from "@/components/admin/article-editor-toolbar"
import { uploadMediaFile } from "@/components/admin/media/media-api"
import type { MediaAssetSummary } from "@/lib/media/assets"
import {
  ARTICLE_IMAGE_MIME_TYPES,
  createArticleEditorExtensions,
} from "@/lib/mdx-editor/tiptap"

type ArticleRichEditorProps = {
  value: string
  onChange: (value: string) => void
  ariaLabel?: string
}

function ArticleRichEditor({
  value,
  onChange,
  ariaLabel = "文章可视化编辑器",
}: ArticleRichEditorProps) {
  const lastEmittedValueRef = useRef(value)
  const [pendingImages, setPendingImages] = useState<ArticleImageDialogValue[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const pendingImage = pendingImages[0] ?? null

  const handleFiles = useCallback(async (files: File[], position?: number) => {
    const validFiles = files.filter((file) =>
      ARTICLE_IMAGE_MIME_TYPES.includes(
        file.type as (typeof ARTICLE_IMAGE_MIME_TYPES)[number]
      )
    )

    if (validFiles.length === 0) {
      setUploadError("请选择 JPG、PNG、WebP 或 GIF 图片。")
      return
    }

    setUploadError(null)

    try {
      const uploadedAssets = await Promise.all(
        validFiles.map((file) => uploadMediaFile(file))
      )
      const nextImages = uploadedAssets.map((asset, index) => ({
        src: asset.publicUrl,
        displayName: asset.displayName,
        alt: asset.displayName,
        mode: "insert" as const,
        position: index === 0 ? position : undefined,
      }))

      setPendingImages((current) => [...current, ...nextImages])
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "图片上传失败")
    }
  }, [])

  const extensions = useMemo(
    () => createArticleEditorExtensions({ onFiles: handleFiles }),
    [handleFiles]
  )

  const editor = useEditor({
    extensions,
    content: value,
    contentType: "markdown",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[30rem] px-5 py-5 text-base leading-8 text-[#c6d2c1] outline-none sm:px-6 [&_a]:text-[var(--safety-exit-green)] [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--safety-exit-green)] [&_blockquote]:bg-[#171b16] [&_blockquote]:px-4 [&_blockquote]:py-2 [&_code]:rounded [&_code]:bg-[#10130f] [&_code]:px-1 [&_code]:text-[#e2b86c] [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-5 [&_img]:max-h-[36rem] [&_img]:rounded-md [&_img]:border [&_img]:border-white/10 [&_img]:object-contain [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-[#10130f] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_ul]:list-disc [&_ul]:pl-6",
        "aria-label": ariaLabel,
      },
    },
    onUpdate: ({ editor: updatedEditor }) => {
      const markdown = updatedEditor.getMarkdown()
      lastEmittedValueRef.current = markdown
      onChange(markdown)
    },
  })

  useEffect(() => {
    if (!editor || value === lastEmittedValueRef.current) {
      return
    }

    if (editor.getMarkdown() !== value) {
      editor.commands.setContent(value, {
        contentType: "markdown",
        emitUpdate: false,
      })
    }

    lastEmittedValueRef.current = value
  }, [editor, value])

  function openSelectedImage() {
    if (!editor) {
      return
    }

    const position = editor.state.selection.from
    const node =
      editor.state.doc.nodeAt(position) ??
      (position > 0 ? editor.state.doc.nodeAt(position - 1) : null)

    if (!node || node.type.name !== "image") {
      return
    }

    const attributes = editor.getAttributes("image") as {
      src?: string
      alt?: string
    }

    setPendingImages([
      {
        src: attributes.src ?? "",
        displayName: attributes.alt || "当前图片",
        alt: attributes.alt ?? "",
        mode: "edit",
        position,
      },
    ])
  }

  function selectMedia(asset: MediaAssetSummary) {
    setUploadError(null)
    setPendingImages([
      {
        src: asset.publicUrl,
        displayName: asset.displayName,
        alt: asset.displayName,
        mode: "insert",
        position: editor?.state.selection.from,
      },
    ])
  }

  function confirmImage(alt: string) {
    if (!editor || !pendingImage) {
      return
    }

    if (pendingImage.mode === "edit") {
      editor.chain().focus().updateAttributes("image", { alt }).run()
    } else {
      const position = pendingImage.position ?? editor.state.selection.from
      editor
        .chain()
        .focus()
        .insertContentAt(position, {
          type: "image",
          attrs: {
            src: pendingImage.src,
            alt,
            title: null,
          },
        })
        .run()
    }

    setPendingImages((current) => current.slice(1))
  }

  function closeImageDialog() {
    setPendingImages([])
  }

  return (
    <div className="overflow-hidden border border-white/10 bg-[#10130f]" data-testid="article-rich-editor">
      <ArticleEditorToolbar
        editor={editor}
        onUploadFiles={(files) => void handleFiles(files)}
        onSelectMedia={selectMedia}
        onEditImage={openSelectedImage}
      />
      <EditorContent editor={editor} />
      {uploadError ? (
        <p className="border-t border-[var(--admin-danger)]/20 bg-[var(--admin-danger)]/10 px-4 py-2.5 text-xs text-[var(--admin-danger)]">
          {uploadError}
        </p>
      ) : null}
      {pendingImage ? (
        <ArticleImageDialog
          key={`${pendingImage.mode}-${pendingImage.src}-${pendingImage.position ?? "selection"}`}
          value={pendingImage}
          onConfirm={confirmImage}
          onClose={closeImageDialog}
        />
      ) : null}
    </div>
  )
}

export { ArticleRichEditor }

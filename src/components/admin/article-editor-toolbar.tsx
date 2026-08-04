"use client"

import type { Editor } from "@tiptap/core"
import {
  Bold,
  Code2,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Type,
  Undo2,
} from "lucide-react"

import { MediaPicker } from "@/components/admin/media/media-picker"
import { Button } from "@/components/ui/button"
import type { MediaAssetSummary } from "@/lib/media/assets"

type ArticleEditorToolbarProps = {
  editor: Editor | null
  onUploadFiles: (files: File[]) => void
  onSelectMedia: (asset: MediaAssetSummary) => void
  onEditImage: () => void
}

function ArticleEditorToolbar({
  editor,
  onUploadFiles,
  onSelectMedia,
  onEditImage,
}: ArticleEditorToolbarProps) {
  const inputId = "article-editor-image-upload"

  function toggleLink() {
    if (!editor) {
      return
    }

    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run()
      return
    }

    const href = window.prompt("输入链接地址")

    if (href?.trim()) {
      editor.chain().focus().setLink({ href: href.trim() }).run()
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-white/[0.03] p-2" aria-label="文章格式工具栏">
      <ToolbarButton label="粗体" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="斜体" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="删除线" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()}>
        <Strikethrough className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="行内代码" active={editor?.isActive("code")} onClick={() => editor?.chain().focus().toggleCode().run()}>
        <Code2 className="size-4" />
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton label="二级标题" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="段落" active={editor?.isActive("paragraph")} onClick={() => editor?.chain().focus().setParagraph().run()}>
        <Type className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="无序列表" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="有序列表" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="引用" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="链接" active={editor?.isActive("link")} onClick={toggleLink}>
        <Link2 className="size-4" />
      </ToolbarButton>
      <ToolbarDivider />
      <label className="inline-flex">
        <span className="sr-only">上传正文图片</span>
        <input
          id={inputId}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(event) => {
            onUploadFiles(event.target.files ? [...event.target.files] : [])
            event.target.value = ""
          }}
        />
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => document.getElementById(inputId)?.click()} aria-label="上传正文图片" title="上传正文图片">
          <ImagePlus className="size-4" />
        </Button>
      </label>
      <MediaPicker onSelect={onSelectMedia} buttonLabel="媒体库" />
      {editor?.isActive("image") ? (
        <ToolbarButton label="编辑图片 alt" onClick={onEditImage}>
          <ImagePlus className="size-4" />
        </ToolbarButton>
      ) : null}
      <span className="ml-auto flex items-center gap-1">
        <ToolbarButton label="撤销" onClick={() => editor?.chain().focus().undo().run()}>
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="重做" onClick={() => editor?.chain().focus().redo().run()}>
          <Redo2 className="size-4" />
        </ToolbarButton>
      </span>
    </div>
  )
}

function ToolbarButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={active ? "bg-[var(--safety-exit-green)]/15 text-[var(--safety-exit-green-strong)]" : undefined}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px bg-white/10" aria-hidden="true" />
}

export { ArticleEditorToolbar }

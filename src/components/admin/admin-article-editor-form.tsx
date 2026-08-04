"use client"

import * as React from "react"
import { evaluate } from "@mdx-js/mdx"
import Link from "next/link"
import {
  ExternalLink,
  History,
  ImagePlus,
  LoaderCircle,
  Save,
  Send,
  Trash2,
} from "lucide-react"
import * as jsxRuntime from "react/jsx-runtime"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"

import { AdminDatePicker } from "@/components/admin/admin-date-picker"
import { ArticleRichEditor } from "@/components/admin/article-rich-editor"
import { useEditorScrollSync } from "@/components/admin/editor-scroll-sync"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { Button } from "@/components/ui/button"
import { MdxEditor } from "@/components/admin/mdx-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { uploadMediaFile } from "@/components/admin/media/media-api"
import { canUseVisualEditor } from "@/lib/mdx-editor/tiptap"
import { normalizeMdxSource } from "@/lib/mdx"
import { hasMissingImageAlt } from "@/lib/media/references"
import { cn } from "@/lib/utils"

type AdminArticleEditorFormProps = {
  mode: "create" | "edit"
  action: (formData: FormData) => void | Promise<void>
  values: {
    slug: string
    title: string
    desc: string
    category: string
    tags: string
    cover: string
    publishedAt: string
    content: string
  }
  statusLabel: string
  lastEditedByName?: string | null
  historyHref?: string
  previewHref?: string | null
  message?: string | null
}

type PreviewContentComponent = React.ComponentType<{
  components?: Record<string, React.ComponentType<object>>
}>

function AdminArticleEditorForm({
  mode,
  action,
  values,
  statusLabel,
  lastEditedByName,
  historyHref,
  previewHref,
  message,
}: AdminArticleEditorFormProps) {
  const [draft, setDraft] = React.useState(values)
  const deferredDraft = React.useDeferredValue(draft)
  const [PreviewContent, setPreviewContent] =
    React.useState<PreviewContentComponent | null>(null)
  const [previewLoading, setPreviewLoading] = React.useState(true)
  const [previewError, setPreviewError] = React.useState<string | null>(null)
  const [isWideLayout, setIsWideLayout] = React.useState(false)
  const [isCoverUploading, setIsCoverUploading] = React.useState(false)
  const [coverUploadError, setCoverUploadError] = React.useState<string | null>(
    null
  )
  const [imageAltError, setImageAltError] = React.useState<string | null>(null)
  const [activeEditorView, setActiveEditorView] = React.useState<
    "visual" | "source" | "preview"
  >(() => (canUseVisualEditor(values.content) ? "visual" : "source"))
  const visualEditorAvailable = canUseVisualEditor(draft.content)
  const sourceScrollRef = React.useRef<HTMLElement | null>(null)
  const previewScrollRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return
    }

    const mediaQuery = window.matchMedia("(min-width: 1280px)")
    const handleMediaChange = () => {
      setIsWideLayout(mediaQuery.matches)
    }

    handleMediaChange()
    mediaQuery.addEventListener("change", handleMediaChange)

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange)
    }
  }, [])

  useEditorScrollSync(
    sourceScrollRef,
    previewScrollRef,
    isWideLayout && activeEditorView === "source"
  )

  const previewComponents = {
    h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
      <h2
        {...props}
        className={cn(
          "mt-12 text-2xl font-semibold tracking-tight text-[#edf3e9]",
          props.className
        )}
      />
    ),
    h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
      <h3
        {...props}
        className={cn(
          "mt-10 text-xl font-semibold tracking-tight text-[#dce6d8]",
          props.className
        )}
      />
    ),
    p: (props: React.ComponentPropsWithoutRef<"p">) => (
      <p
        {...props}
        className={cn("my-6 leading-8 text-[#c6d2c1]", props.className)}
      />
    ),
    a: (props: React.ComponentPropsWithoutRef<"a">) => (
      <a
        {...props}
        className={cn(
          "text-[var(--safety-exit-green)] underline decoration-[var(--safety-exit-green)]/50 underline-offset-4 transition-colors hover:text-[var(--safety-exit-green-strong)]",
          props.className
        )}
      />
    ),
    blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
      <blockquote
        {...props}
        className={cn(
          "my-8 border-l-2 border-[var(--safety-exit-green)] bg-[#10130f] px-5 py-4 text-[#dce6d8]",
          props.className
        )}
      />
    ),
    code: (props: React.ComponentPropsWithoutRef<"code">) => (
      <code
        {...props}
        className={cn(
          "rounded bg-[#10130f] px-1.5 py-0.5 font-mono text-[0.95em] text-[#e2b86c]",
          props.className
        )}
      />
    ),
    pre: (props: React.ComponentPropsWithoutRef<"pre">) => (
      <pre
        {...props}
        className={cn(
          "my-8 overflow-x-auto rounded-md border border-white/10 bg-[#10130f] px-4 py-4 font-mono text-sm leading-7 text-[#c6d2c1]",
          props.className
        )}
      />
    ),
  }

  React.useEffect(() => {
    const timer = window.setTimeout(async () => {
      const normalizedSource = normalizeMdxSource(deferredDraft.content)

      if (!normalizedSource.trim()) {
        setPreviewError(null)
        setPreviewLoading(false)
        React.startTransition(() => {
          setPreviewContent(null)
        })
        return
      }

      setPreviewLoading(true)
      setPreviewError(null)

      try {
        const evaluated = await evaluate(normalizedSource, {
          ...jsxRuntime,
          remarkPlugins: [[remarkMath, { singleDollarTextMath: true }]],
          rehypePlugins: [[rehypeKatex]],
        })
        React.startTransition(() => {
          setPreviewContent(() => evaluated.default as PreviewContentComponent)
        })
      } catch {
        setPreviewError("预览编译失败，请检查 MDX 或公式语法。")
      } finally {
        setPreviewLoading(false)
      }
    }, 180)

    return () => {
      window.clearTimeout(timer)
    }
  }, [deferredDraft.content])

  function handleFieldChange(field: keyof typeof values) {
    return (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const nextValue = event.target.value

      setDraft((current) => ({
        ...current,
        [field]: nextValue,
      }))
    }
  }

  async function handleCoverUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) {
      return
    }

    setCoverUploadError(null)
    setIsCoverUploading(true)

    try {
      const asset = await uploadMediaFile(file)
      setDraft((current) => ({
        ...current,
        cover: asset.publicUrl,
      }))
    } catch (error) {
      setCoverUploadError(
        error instanceof Error ? error.message : "封面上传失败"
      )
    } finally {
      setIsCoverUploading(false)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (hasMissingImageAlt(draft.content)) {
      event.preventDefault()
      setImageAltError("请为正文中的每张图片填写 alt 文本后再保存。")
      return
    }

    setImageAltError(null)
  }

  const showingSourceEditor =
    activeEditorView === "source" ||
    (activeEditorView === "visual" && !visualEditorAvailable)
  const showingVisualEditor =
    activeEditorView === "visual" && visualEditorAvailable

  return (
    <section className="admin-surface p-4 sm:p-6 lg:p-7">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <p className="admin-kicker-accent">
            {mode === "create" ? "New Article" : "Edit Article"}
          </p>
          <span className="admin-status-pill admin-status-muted">
            {statusLabel}
          </span>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="admin-title">
              {mode === "create" ? "新建文章" : "在线编辑文章"}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-[#9aa79a]">
            {lastEditedByName ? (
              <span>最近编辑：{lastEditedByName}</span>
            ) : null}
            {historyHref ? (
              <Link
                href={historyHref}
                className="admin-link inline-flex items-center gap-1.5"
              >
                <History className="size-3.5" aria-hidden="true" />
                查看修订历史
              </Link>
            ) : null}
            {previewHref ? (
              <Link
                href={previewHref}
                className="admin-link inline-flex items-center gap-1.5"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                预览公开页
              </Link>
            ) : null}
          </div>
        </div>
        {message ? <p className="admin-copy">{message}</p> : null}
      </div>

      <form action={action} onSubmit={handleSubmit}>
        <section
          data-editor-section="metadata"
          className="border-b border-white/10 py-6"
        >
          <div className="border-b border-white/10 pb-4">
            <p className="admin-kicker">Article Metadata</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#edf3e9]">
              文章元数据
            </h2>
          </div>

          <div className="mt-5 grid gap-5">
            {mode === "edit" ? (
              <input type="hidden" name="slug" value={draft.slug} />
            ) : null}

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="article-title" className="text-[#dce6d8]">
                  标题
                </Label>
                <Input
                  id="article-title"
                  type="text"
                  name="title"
                  required
                  value={draft.title}
                  onChange={handleFieldChange("title")}
                  className="admin-input"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="article-slug" className="text-[#dce6d8]">
                  Slug
                </Label>
                <Input
                  id="article-slug"
                  type="text"
                  name="slug"
                  required
                  readOnly={mode === "edit"}
                  value={draft.slug}
                  onChange={handleFieldChange("slug")}
                  className="admin-input read-only:bg-[#10130f] read-only:text-[#748073]"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="article-desc" className="text-[#dce6d8]">
                摘要
              </Label>
              <Textarea
                id="article-desc"
                name="desc"
                required
                value={draft.desc}
                onChange={handleFieldChange("desc")}
                rows={3}
                className="admin-input leading-7"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="article-category" className="text-[#dce6d8]">
                  分类
                </Label>
                <Input
                  id="article-category"
                  type="text"
                  name="category"
                  required
                  value={draft.category}
                  onChange={handleFieldChange("category")}
                  className="admin-input"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="article-published-at"
                  className="text-[#dce6d8]"
                >
                  发布日期
                </Label>
                <AdminDatePicker
                  id="article-published-at"
                  name="publishedAt"
                  required
                  value={draft.publishedAt}
                  onChange={(publishedAt) =>
                    setDraft((current) => ({ ...current, publishedAt }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="article-tags" className="text-[#dce6d8]">
                  标签
                </Label>
                <Input
                  id="article-tags"
                  type="text"
                  name="tags"
                  required
                  value={draft.tags}
                  onChange={handleFieldChange("tags")}
                  placeholder="用逗号分隔，例如：writing, systems"
                  className="admin-input"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="article-cover" className="text-[#dce6d8]">
                  封面（可选）
                </Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="article-cover"
                    type="text"
                    name="cover"
                    value={draft.cover}
                    onChange={handleFieldChange("cover")}
                    placeholder="留空则不显示封面"
                    className="admin-input"
                  />
                  <div className="flex flex-wrap gap-2">
                    <MediaPicker
                      onSelect={(asset) => {
                        setDraft((current) => ({
                          ...current,
                          cover: asset.publicUrl,
                        }))
                        setCoverUploadError(null)
                      }}
                      buttonLabel="选择媒体"
                    />
                    <input
                      id="article-cover-upload"
                      className="sr-only"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleCoverUpload}
                      aria-label="上传封面"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isCoverUploading}
                      onClick={() =>
                        document.getElementById("article-cover-upload")?.click()
                      }
                    >
                      {isCoverUploading ? (
                        <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <ImagePlus className="size-3.5" aria-hidden="true" />
                      )}
                      {isCoverUploading ? "上传中…" : "上传封面"}
                    </Button>
                    {draft.cover ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDraft((current) => ({ ...current, cover: "" }))
                          setCoverUploadError(null)
                        }}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        清空封面
                      </Button>
                    ) : null}
                  </div>
                </div>
                {coverUploadError ? (
                  <p className="text-xs text-[var(--admin-danger)]">
                    {coverUploadError}
                  </p>
                ) : null}
                {draft.cover ? (
                  <div className="mt-1 overflow-hidden border border-white/10 bg-[#10130f]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={draft.cover}
                      alt="当前文章封面"
                      className="h-28 w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <input type="hidden" name="content" value={draft.content} />
        </section>

        <section data-editor-workbench className="mt-6">
          <div
            aria-label="编辑视图"
            className="mb-4 grid grid-cols-3 border border-white/10 bg-white/[0.03] p-1"
          >
              <button
                type="button"
                aria-pressed={activeEditorView === "visual"}
                aria-controls="article-editor-visual-panel"
                disabled={!visualEditorAvailable}
                title={
                  visualEditorAvailable
                    ? "使用可视化编辑器"
                    : "当前正文包含复杂 MDX，请使用源码模式"
                }
                className={cn(
                  "min-h-10 px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                  activeEditorView === "visual"
                    ? "bg-[var(--safety-exit-green)]/15 text-[var(--safety-exit-green-strong)]"
                    : "text-[#9aa79a] hover:bg-white/[0.05] hover:text-[#edf3e9]"
                )}
                onClick={() => setActiveEditorView("visual")}
              >
                可视化
              </button>
              <button
                type="button"
                aria-pressed={activeEditorView === "source"}
                aria-controls="article-editor-source-panel"
                className={cn(
                  "min-h-10 px-3 text-sm font-semibold transition-colors",
                  activeEditorView === "source"
                    ? "bg-[var(--safety-exit-green)]/15 text-[var(--safety-exit-green-strong)]"
                    : "text-[#9aa79a] hover:bg-white/[0.05] hover:text-[#edf3e9]"
                )}
                onClick={() => setActiveEditorView("source")}
              >
                源码
              </button>
              <button
                type="button"
                aria-pressed={activeEditorView === "preview"}
                aria-controls="article-editor-preview-panel"
                className={cn(
                  "min-h-10 px-3 text-sm font-semibold transition-colors",
                  activeEditorView === "preview"
                    ? "bg-[var(--safety-exit-green)]/15 text-[var(--safety-exit-green-strong)]"
                    : "text-[#9aa79a] hover:bg-white/[0.05] hover:text-[#edf3e9]"
                )}
                onClick={() => setActiveEditorView("preview")}
              >
                效果
              </button>
          </div>

          <div className="grid min-w-0 gap-6 xl:grid-cols-2 xl:items-start">
            {showingSourceEditor ? (
              <section
                id="article-editor-source-panel"
                data-editor-panel="source"
                data-testid="article-editor-source-panel"
                aria-labelledby="article-editor-source-heading"
                className="min-w-0 overflow-hidden border border-white/10 bg-[#10130f]"
              >
                <div
                  data-editor-panel-header
                  className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-3 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="admin-kicker-accent">MDX Source</p>
                    <h2
                      id="article-editor-source-heading"
                      className="mt-1 text-lg font-semibold tracking-tight text-[#edf3e9]"
                    >
                      MDX 源码
                    </h2>
                  </div>
                  <p className="shrink-0 text-xs text-[#748073]">
                    {visualEditorAvailable ? "可编辑" : "复杂 MDX / 源码"}
                  </p>
                </div>
                <div className="h-[32rem] min-h-0 overflow-hidden">
                  <MdxEditor
                    id="article-content"
                    ariaLabel="MDX 源码编辑器"
                    value={draft.content}
                    className="h-full rounded-none border-0"
                    scrollContainerRef={sourceScrollRef}
                    onChange={(content) => {
                      setDraft((current) => ({
                        ...current,
                        content,
                      }))
                    }}
                  />
                </div>
              </section>
            ) : null}

            {showingVisualEditor ? (
              <section
                id="article-editor-visual-panel"
                data-editor-panel="visual"
                data-testid="article-editor-visual-panel"
                aria-labelledby="article-editor-visual-heading"
                className="min-w-0 overflow-hidden border border-white/10 bg-[#10130f]"
              >
                <div
                  data-editor-panel-header
                  className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-3 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="admin-kicker-accent">Structured Editor</p>
                    <h2
                      id="article-editor-visual-heading"
                      className="mt-1 text-lg font-semibold tracking-tight text-[#edf3e9]"
                    >
                      可视化编辑器
                    </h2>
                  </div>
                  <p className="shrink-0 text-xs text-[#748073]">正文保存为 MDX</p>
                </div>
                <ArticleRichEditor
                  value={draft.content}
                  ariaLabel="文章可视化编辑器"
                  onChange={(content) => {
                    setDraft((current) => ({
                      ...current,
                      content,
                    }))
                  }}
                />
              </section>
            ) : null}

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-5 xl:order-3 xl:col-span-2">
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  name="intent"
                  value="draft"
                  variant="outline"
                >
                  <Save className="size-4" aria-hidden="true" />
                  保存草稿
                </Button>
                <Button type="submit" name="intent" value="publish">
                  <Send className="size-4" aria-hidden="true" />
                  发布更新
                </Button>
              </div>
            </div>

            {isWideLayout || activeEditorView === "preview" ? (
              <aside className="min-w-0 xl:sticky xl:top-24 xl:order-2">
                <section
                  id="article-editor-preview-panel"
                  data-editor-panel="preview"
                  data-testid="article-editor-preview-panel"
                  aria-labelledby="article-editor-preview-heading"
                  className="min-w-0 overflow-hidden border border-white/10 bg-[#10130f]"
                >
                  <div
                    data-editor-panel-header
                    className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-3 sm:px-5"
                  >
                    <div>
                      <p className="admin-kicker-accent">Live Preview</p>
                      <h2
                        id="article-editor-preview-heading"
                        className="mt-1 text-lg font-semibold tracking-tight text-[#edf3e9]"
                      >
                        实时效果
                      </h2>
                    </div>
                    <p className="admin-copy">
                      {previewLoading ? "正在更新预览..." : "预览已同步"}
                    </p>
                  </div>

                  <PerfectScrollbar
                    scrollContainerRef={previewScrollRef}
                    data-testid="article-editor-preview-scroll"
                    className="h-[32rem] min-h-0 px-4 py-5 sm:px-6 sm:py-6"
                  >
                    {previewError ? (
                      <div className="border border-dashed border-destructive/40 px-5 py-8 text-sm text-destructive">
                        {previewError}
                      </div>
                    ) : previewLoading && !PreviewContent ? (
                      <div className="grid gap-4">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-4/5" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-5/6" />
                        <Skeleton className="h-64 w-full rounded-md" />
                      </div>
                    ) : (
                      <article className="mx-auto min-h-[30rem] w-full max-w-3xl text-[#edf3e9]">
                        <header className="space-y-5 border-b border-white/10 pb-8">
                          <span className="admin-chip">
                            {draft.category.trim() || "未分类"}
                          </span>
                          <div className="space-y-3">
                            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                              {draft.title.trim() || "未命名文章"}
                            </h1>
                            <p className="admin-copy text-base md:text-lg">
                              {draft.desc.trim() || "这里会显示文章摘要预览。"}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#9aa79a]">
                            <span>{draft.publishedAt || "发布日期未设置"}</span>
                            <span className="text-white/16">/</span>
                            <span>{draft.category.trim() || "未分类"}</span>
                          </div>
                          <ul className="flex flex-wrap gap-2">
                            {draft.tags
                              .split(/[,\n]/)
                              .map((tag) => tag.trim())
                              .filter(Boolean)
                              .map((tag) => (
                                <li key={tag} className="admin-chip">
                                  {tag}
                                </li>
                              ))}
                          </ul>
                        </header>

                        <div className="mt-8">
                          {PreviewContent ? (
                            <div className="text-base leading-8 text-[#c6d2c1] [&_hr]:my-10 [&_hr]:border-white/10 [&_img]:rounded-md [&_img]:border [&_img]:border-white/10 [&_img]:bg-[#10130f] [&_li]:my-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:text-[#edf3e9] [&_table]:my-8 [&_table]:w-full [&_table]:border-collapse [&_tbody_td]:border [&_tbody_td]:border-white/10 [&_tbody_td]:px-3 [&_tbody_td]:py-2 [&_thead_th]:border [&_thead_th]:border-white/10 [&_thead_th]:bg-white/[0.04] [&_thead_th]:px-3 [&_thead_th]:py-2 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6">
                              <PreviewContent components={previewComponents} />
                            </div>
                          ) : (
                            <div className="admin-empty px-5 py-12 text-sm">
                              开始输入正文后，这里会实时显示 MDX
                              预览，包括数学公式。
                            </div>
                          )}
                        </div>
                      </article>
                    )}
                  </PerfectScrollbar>
                </section>
              </aside>
            ) : null}

            {imageAltError ? (
              <p
                role="alert"
                className="border-t border-[var(--admin-danger)]/20 pt-4 text-sm text-[var(--admin-danger)] xl:order-4 xl:col-span-2"
              >
                {imageAltError}
              </p>
            ) : null}
          </div>
        </section>
      </form>
    </section>
  )
}

export { AdminArticleEditorForm }

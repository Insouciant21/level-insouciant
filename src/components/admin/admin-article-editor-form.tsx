"use client"

import * as React from "react"
import { evaluate } from "@mdx-js/mdx"
import Link from "next/link"
import * as jsxRuntime from "react/jsx-runtime"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { normalizeMdxSource } from "@/lib/mdx"
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

  const previewComponents = {
    h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
      <h2
        {...props}
        className={cn(
          "mt-12 text-2xl font-semibold tracking-tight text-[#e0e0e0]",
          props.className
        )}
      />
    ),
    h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
      <h3
        {...props}
        className={cn(
          "mt-10 text-xl font-semibold tracking-tight text-[#d1d5db]",
          props.className
        )}
      />
    ),
    p: (props: React.ComponentPropsWithoutRef<"p">) => (
      <p
        {...props}
        className={cn("my-6 leading-8 text-[#c9c9c3]", props.className)}
      />
    ),
    a: (props: React.ComponentPropsWithoutRef<"a">) => (
      <a
        {...props}
        className={cn(
          "text-amber-400 underline decoration-amber-700 underline-offset-4 transition-colors hover:text-amber-200",
          props.className
        )}
      />
    ),
    blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
      <blockquote
        {...props}
        className={cn(
          "my-8 border-l-2 border-green-500 bg-[#111111] px-5 py-4 text-[#e5e7eb]",
          props.className
        )}
      />
    ),
    code: (props: React.ComponentPropsWithoutRef<"code">) => (
      <code
        {...props}
        className={cn(
          "rounded bg-[#111111] px-1.5 py-0.5 font-mono text-[0.95em] text-amber-300",
          props.className
        )}
      />
    ),
    pre: (props: React.ComponentPropsWithoutRef<"pre">) => (
      <pre
        {...props}
        className={cn(
          "my-8 overflow-x-auto rounded-[1.75rem] border border-[#333333] bg-[#111111] px-4 py-4 font-mono text-sm leading-7 text-[#d1d5db]",
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

  return (
    <section className="admin-surface px-6 py-6 sm:px-7">
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
            <p className="admin-copy mt-2">
              使用结构化字段加原始 MDX 正文编辑，保存即生成修订记录。
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-[#8c8c8c]">
            {lastEditedByName ? (
              <span>最近编辑：{lastEditedByName}</span>
            ) : null}
            {historyHref ? (
              <Link href={historyHref} className="admin-link">
                查看修订历史
              </Link>
            ) : null}
            {previewHref ? (
              <Link href={previewHref} className="admin-link">
                预览公开页
              </Link>
            ) : null}
          </div>
        </div>
        {message ? <p className="admin-copy">{message}</p> : null}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
        <form action={action} className="grid gap-5">
          {mode === "edit" ? (
            <input type="hidden" name="slug" value={draft.slug} />
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="article-title" className="text-[#e0e0e0]">
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
              <Label htmlFor="article-slug" className="text-[#e0e0e0]">
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
                className="admin-input read-only:bg-[#0a0a0a] read-only:text-[#6b7280]"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="article-desc" className="text-[#e0e0e0]">
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
              <Label htmlFor="article-category" className="text-[#e0e0e0]">
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
              <Label htmlFor="article-published-at" className="text-[#e0e0e0]">
                发布日期
              </Label>
              <Input
                id="article-published-at"
                type="date"
                name="publishedAt"
                required
                value={draft.publishedAt}
                onChange={handleFieldChange("publishedAt")}
                className="admin-input"
              />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="article-tags" className="text-[#e0e0e0]">
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
              <Label htmlFor="article-cover" className="text-[#e0e0e0]">
                封面（可选）
              </Label>
              <Input
                id="article-cover"
                type="text"
                name="cover"
                value={draft.cover}
                onChange={handleFieldChange("cover")}
                placeholder="留空则不显示封面"
                className="admin-input"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="article-content" className="text-[#e0e0e0]">
              正文 MDX
            </Label>
            <Textarea
              id="article-content"
              name="content"
              required
              value={draft.content}
              onChange={handleFieldChange("content")}
              rows={24}
              className="admin-input min-h-[32rem] font-mono leading-7 xl:min-h-[44rem]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <p className="admin-copy">
              {mode === "create"
                ? "创建后会立刻写入数据库并生成第一条修订记录。"
                : "每次保存都会生成修订记录，便于后续回滚。"}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                name="intent"
                value="draft"
                variant="outline"
              >
                保存草稿
              </Button>
              <Button type="submit" name="intent" value="publish">
                发布更新
              </Button>
            </div>
          </div>
        </form>

        <aside className="xl:sticky xl:top-24">
          <section className="admin-surface-muted px-6 py-6">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="admin-kicker-accent">Live Preview</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#4ade80]">
                  实时预览
                </h2>
              </div>
              <p className="admin-copy">
                {previewLoading ? "正在更新预览..." : "预览已同步"}
              </p>
            </div>

            <div className="mt-6">
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
                  <Skeleton className="h-64 w-full rounded-[1.75rem]" />
                </div>
              ) : (
                <article className="mx-auto min-h-[30rem] w-full max-w-3xl text-[#e0e0e0]">
                  <header className="space-y-5 border-b border-white/10 pb-8">
                    <span className="admin-chip">
                      {draft.category.trim() || "未分类"}
                    </span>
                    <div className="space-y-3">
                      <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-5xl">
                        {draft.title.trim() || "未命名文章"}
                      </h1>
                      <p className="admin-copy text-base md:text-lg">
                        {draft.desc.trim() || "这里会显示文章摘要预览。"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#8c8c8c]">
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
                      <div className="text-base leading-8 text-[#d1d5db] [&_hr]:my-10 [&_hr]:border-white/10 [&_img]:rounded-[1.75rem] [&_img]:border [&_img]:border-[#333333] [&_img]:bg-[#0a0a0a] [&_li]:my-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:text-[#e0e0e0] [&_table]:my-8 [&_table]:w-full [&_table]:border-collapse [&_tbody_td]:border [&_tbody_td]:border-white/10 [&_tbody_td]:px-3 [&_tbody_td]:py-2 [&_thead_th]:border [&_thead_th]:border-white/10 [&_thead_th]:bg-[#141414] [&_thead_th]:px-3 [&_thead_th]:py-2 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6">
                        <PreviewContent components={previewComponents} />
                      </div>
                    ) : (
                      <div className="admin-empty px-5 py-12 text-sm">
                        开始输入正文后，这里会实时显示 MDX 预览，包括数学公式。
                      </div>
                    )}
                  </div>
                </article>
              )}
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}

export { AdminArticleEditorForm }

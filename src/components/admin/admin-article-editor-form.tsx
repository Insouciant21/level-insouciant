"use client"

import * as React from "react"
import { evaluate } from "@mdx-js/mdx"
import Link from "next/link"
import * as jsxRuntime from "react/jsx-runtime"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
  const [PreviewContent, setPreviewContent] = React.useState<PreviewContentComponent | null>(null)
  const [previewLoading, setPreviewLoading] = React.useState(true)
  const [previewError, setPreviewError] = React.useState<string | null>(null)

  const previewComponents = {
    h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
      <h2 {...props} className={cn("mt-12 text-2xl font-semibold tracking-tight", props.className)} />
    ),
    h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
      <h3 {...props} className={cn("mt-10 text-xl font-semibold tracking-tight", props.className)} />
    ),
    pre: (props: React.ComponentPropsWithoutRef<"pre">) => (
      <pre
        {...props}
        className={cn(
          "overflow-x-auto rounded-[1.75rem] border border-border/70 bg-muted/35 px-4 py-4 font-mono text-sm leading-7",
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

  function handleFieldChange(
    field: keyof typeof values
  ) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value

      setDraft((current) => ({
        ...current,
        [field]: nextValue,
      }))
    }
  }

  return (
    <section className="surface-panel px-6 py-6">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {mode === "create" ? "New Article" : "Edit Article"}
          </p>
          <span className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
            {statusLabel}
          </span>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "create" ? "新建文章" : "在线编辑文章"}
            </h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              使用结构化字段加原始 MDX 正文编辑，保存即生成修订记录。
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {lastEditedByName ? <span>最近编辑：{lastEditedByName}</span> : null}
            {historyHref ? (
              <Link href={historyHref} className="text-primary underline underline-offset-4">
                查看修订历史
              </Link>
            ) : null}
            {previewHref ? (
              <Link href={previewHref} className="text-primary underline underline-offset-4">
                预览公开页
              </Link>
            ) : null}
          </div>
        </div>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
        <form action={action} className="grid gap-5">
          {mode === "edit" ? <input type="hidden" name="slug" value={draft.slug} /> : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">标题</span>
              <input
                type="text"
                name="title"
                required
                value={draft.title}
                onChange={handleFieldChange("title")}
                className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Slug</span>
              <input
                type="text"
                name="slug"
                required
                readOnly={mode === "edit"}
                value={draft.slug}
                onChange={handleFieldChange("slug")}
                className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50 read-only:bg-muted/35 read-only:text-muted-foreground"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium">摘要</span>
            <textarea
              name="desc"
              required
              value={draft.desc}
              onChange={handleFieldChange("desc")}
              rows={3}
              className="resize-y rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm leading-7 outline-none transition focus:border-primary/50"
            />
          </label>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">分类</span>
              <input
                type="text"
                name="category"
                required
                value={draft.category}
                onChange={handleFieldChange("category")}
                className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">发布日期</span>
              <input
                type="date"
                name="publishedAt"
                required
                value={draft.publishedAt}
                onChange={handleFieldChange("publishedAt")}
                className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50"
              />
            </label>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">标签</span>
              <input
                type="text"
                name="tags"
                required
                value={draft.tags}
                onChange={handleFieldChange("tags")}
                placeholder="用逗号分隔，例如：writing, systems"
                className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">封面</span>
              <input
                type="text"
                name="cover"
                required
                value={draft.cover}
                onChange={handleFieldChange("cover")}
                className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium">正文 MDX</span>
            <textarea
              name="content"
              required
              value={draft.content}
              onChange={handleFieldChange("content")}
              rows={24}
              className="min-h-[32rem] resize-y rounded-[1.75rem] border border-border/70 bg-background px-4 py-4 font-mono text-sm leading-7 outline-none transition focus:border-primary/50 xl:min-h-[44rem]"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
            <p className="text-sm text-muted-foreground">
              {mode === "create"
                ? "创建后会立刻写入数据库并生成第一条修订记录。"
                : "每次保存都会生成修订记录，便于后续回滚。"}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" name="intent" value="draft" variant="outline" className="rounded-full">
                保存草稿
              </Button>
              <Button type="submit" name="intent" value="publish" className="rounded-full">
                发布更新
              </Button>
            </div>
          </div>
        </form>

        <aside className="xl:sticky xl:top-24">
          <section className="surface-panel min-h-[36rem] px-6 py-6">
            <div className="flex flex-col gap-3 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Live Preview</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">实时预览</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {previewLoading ? "正在更新预览..." : "预览已同步"}
              </p>
            </div>

            <div className="mt-6">
              {previewError ? (
                <div className="rounded-[1.75rem] border border-dashed border-destructive/40 px-5 py-8 text-sm text-destructive">
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
                <article className="mx-auto min-h-[30rem] w-full max-w-3xl">
                  <header className="space-y-5 border-b border-border/60 pb-8">
                    <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {draft.category.trim() || "未分类"}
                    </span>
                    <div className="space-y-3">
                      <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-5xl">
                        {draft.title.trim() || "未命名文章"}
                      </h1>
                      <p className="text-base leading-7 text-muted-foreground md:text-lg">
                        {draft.desc.trim() || "这里会显示文章摘要预览。"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span>{draft.publishedAt || "发布日期未设置"}</span>
                      <span className="text-border">/</span>
                      <span>{draft.category.trim() || "未分类"}</span>
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {draft.tags
                        .split(/[,\n]/)
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                        .map((tag) => (
                          <li
                            key={tag}
                            className="inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                          >
                            {tag}
                          </li>
                        ))}
                    </ul>
                  </header>

                  <div className="mt-8">
                    {PreviewContent ? (
                      <div className="prose-block">
                        <PreviewContent components={previewComponents} />
                      </div>
                    ) : (
                      <div className="rounded-[1.75rem] border border-dashed border-border px-5 py-12 text-sm text-muted-foreground">
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

import Link from "next/link"

import { Button } from "@/components/ui/button"

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

      <form action={action} className="mt-6 grid gap-5">
        {mode === "edit" ? <input type="hidden" name="slug" value={values.slug} /> : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium">标题</span>
            <input
              type="text"
              name="title"
              required
              defaultValue={values.title}
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
              defaultValue={values.slug}
              className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50 read-only:bg-muted/35 read-only:text-muted-foreground"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">摘要</span>
          <textarea
            name="desc"
            required
            defaultValue={values.desc}
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
              defaultValue={values.category}
              className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">发布日期</span>
            <input
              type="date"
              name="publishedAt"
              required
              defaultValue={values.publishedAt}
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
              defaultValue={values.tags}
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
              defaultValue={values.cover}
              className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/50"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">正文 MDX</span>
          <textarea
            name="content"
            required
            defaultValue={values.content}
            rows={24}
            className="min-h-[32rem] resize-y rounded-[1.75rem] border border-border/70 bg-background px-4 py-4 font-mono text-sm leading-7 outline-none transition focus:border-primary/50"
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
    </section>
  )
}

export { AdminArticleEditorForm }

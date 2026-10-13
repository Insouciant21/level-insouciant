import { createArticleAction } from "@/lib/action-links"
import { AdminArticleEditorForm } from "@/components/admin/admin-article-editor-form"

import type { load } from "@/server/pages/admin-articles-new-index"
import { IslandProvider } from "@/components/providers/island-provider"
function View({ message, publishedAt }: Awaited<ReturnType<typeof load>>) {
  return (
    <AdminArticleEditorForm
      mode="create"
      action={createArticleAction}
      values={{
        slug: "",
        title: "",
        desc: "",
        category: "",
        tags: "",
        cover: "",
        publishedAt,
        content: "",
      }}
      statusLabel="新文章 / 未发布"
      message={message}
    />
  )
}
export default function Page(
  props: Awaited<ReturnType<typeof load>> & { location: string }
) {
  return (
    <IslandProvider location={props.location}>
      <View {...props} />
    </IslandProvider>
  )
}

import { getArticleStats } from "@/lib/admin"
import { formatDisplayDate } from "@/lib/content"

export default async function AdminStatsPage() {
  const articles = await getArticleStats()

  return (
    <section className="surface-panel px-6 py-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Article Analytics</p>
        <h1 className="text-2xl font-semibold tracking-tight">文章统计</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          按文章维度聚合阅读、点赞和评论表现，方便快速判断哪些内容在工作。
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="px-4 py-2 font-medium">文章</th>
              <th className="px-4 py-2 font-medium">状态</th>
              <th className="px-4 py-2 font-medium">发布时间</th>
              <th className="px-4 py-2 font-medium">阅读</th>
              <th className="px-4 py-2 font-medium">点赞</th>
              <th className="px-4 py-2 font-medium">公开评论</th>
              <th className="px-4 py-2 font-medium">隐藏评论</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.slug} className="rounded-3xl bg-background/55">
                <td className="rounded-l-3xl px-4 py-4 align-top">
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{article.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{article.draft ? "草稿 / 隐藏" : "已发布"}</td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{formatDisplayDate(article.date)}</td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{article.views}</td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{article.likes}</td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{article.comments}</td>
                <td className="rounded-r-3xl px-4 py-4 text-sm text-muted-foreground">{article.hiddenComments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

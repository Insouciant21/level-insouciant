import { getArticleStats } from "@/lib/admin"
import { formatDisplayDate } from "@/lib/content"

export default async function AdminStatsPage() {
  const articles = await getArticleStats()

  return (
    <section className="admin-surface px-6 py-6">
      <div className="flex flex-col gap-2">
        <p className="admin-kicker">Article Analytics</p>
        <h1 className="admin-title">文章统计</h1>
        <p className="admin-copy">
          按文章维度聚合阅读、点赞和评论表现，方便快速判断哪些内容在工作。
        </p>
      </div>

      <div className="mt-6 overflow-hidden border border-[#333333] bg-[#111111] shadow-[0_24px_48px_-36px_rgba(0,0,0,0.72)]">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#0a0a0a]">
            <tr className="text-left text-sm text-[#8c8c8c]">
              <th className="px-4 py-2 font-medium">文章</th>
              <th className="px-4 py-2 font-medium">状态</th>
              <th className="px-4 py-2 font-medium">发布时间</th>
              <th className="px-4 py-2 font-medium">阅读</th>
              <th className="px-4 py-2 font-medium">点赞</th>
              <th className="px-4 py-2 font-medium">公开评论</th>
              <th className="px-4 py-2 font-medium">隐藏评论</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {articles.map((article) => (
              <tr key={article.slug} className="transition-colors hover:bg-[#161616]">
                <td className="px-4 py-4 align-top">
                  <div>
                    <p className="font-medium text-[#e0e0e0]">{article.title}</p>
                    <p className="mt-2 text-sm text-[#8c8c8c]">{article.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-[#8c8c8c]">{article.draft ? "草稿 / 隐藏" : "已发布"}</td>
                <td className="px-4 py-4 text-sm text-[#8c8c8c]">{formatDisplayDate(article.date)}</td>
                <td className="px-4 py-4 text-sm text-[#8c8c8c]">{article.views}</td>
                <td className="px-4 py-4 text-sm text-[#8c8c8c]">{article.likes}</td>
                <td className="px-4 py-4 text-sm text-[#8c8c8c]">{article.comments}</td>
                <td className="px-4 py-4 text-sm text-[#8c8c8c]">{article.hiddenComments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

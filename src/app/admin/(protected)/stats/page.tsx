import { getArticleStats } from "@/lib/admin"
import { Card } from "@/components/ui/card"
import { formatDisplayDate } from "@/lib/content"

export default async function AdminStatsPage() {
  const articles = await getArticleStats()

  return (
    <section className="admin-surface p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <p className="admin-kicker-accent">Article Analytics</p>
        <h1 className="admin-title">文章统计</h1>
      </div>

      {articles.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
          <Card className="min-w-[760px] overflow-hidden rounded-none border-0 bg-[#171b16] p-0 text-[#edf3e9] shadow-none">
            <table className="min-w-full border-collapse">
              <thead className="bg-white/[0.04]">
                <tr className="text-left text-xs text-[#9aa79a]">
                  <th scope="col" className="px-4 py-3 font-medium">
                    文章
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    状态
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    发布时间
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    阅读
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    点赞
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    公开评论
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    隐藏评论
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {articles.map((article) => (
                  <tr
                    key={article.slug}
                    className="text-sm transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="max-w-[18rem] px-4 py-4 align-top">
                      <div>
                        <p className="truncate font-medium text-[#edf3e9]">
                          {article.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-[#748073]">
                          {article.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={`admin-status-pill ${article.draft ? "admin-status-draft" : "admin-status-live"}`}
                      >
                        {article.draft ? "草稿" : "已发布"}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top whitespace-nowrap text-[#9aa79a]">
                      {formatDisplayDate(article.date)}
                    </td>
                    <td className="px-4 py-4 align-top text-[#9aa79a]">
                      {article.views}
                    </td>
                    <td className="px-4 py-4 align-top text-[#9aa79a]">
                      {article.likes}
                    </td>
                    <td className="px-4 py-4 align-top text-[#9aa79a]">
                      {article.comments}
                    </td>
                    <td className="px-4 py-4 align-top text-[#9aa79a]">
                      {article.hiddenComments}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      ) : (
        <div className="admin-empty mt-6">还没有可统计的文章数据。</div>
      )}
    </section>
  )
}

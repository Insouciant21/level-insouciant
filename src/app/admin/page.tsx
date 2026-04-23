import Link from "next/link"

export default function AdminEntryPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#111111] px-5 py-16 text-[#e0e0e0]">
      <div className="admin-surface max-w-xl px-6 py-6 text-center">
        <p className="admin-kicker-accent">Admin Routing</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#4ade80]">正在进入后台</h1>
        <p className="admin-copy mt-3">
          正常情况下，这个入口会在请求阶段自动跳转。若你当前仍停在这里，可以直接前往后台登录页。
        </p>
        <Link href="/admin/login" className="admin-link mt-4 inline-flex">
          前往 /admin/login
        </Link>
      </div>
    </main>
  )
}

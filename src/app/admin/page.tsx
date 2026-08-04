import Link from "next/link"

export default function AdminEntryPage() {
  return (
    <main className="admin-console flex min-h-svh items-center justify-center px-5 py-16 text-[#edf3e9]">
      <div className="admin-surface max-w-xl px-6 py-6 text-center">
        <p className="admin-kicker-accent">Admin Routing</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#edf3e9]">
          正在进入后台
        </h1>
        <Link href="/admin/login" className="admin-link mt-4 inline-flex">
          前往 /admin/login
        </Link>
      </div>
    </main>
  )
}

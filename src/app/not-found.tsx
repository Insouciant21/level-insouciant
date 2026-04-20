import Link from "next/link"

import { MotionReveal } from "@/components/motion/page-transition"
import { PageShell } from "@/components/blog/page-shell"

export default function NotFound() {
  return (
    <PageShell>
      <MotionReveal variant="scale">
        <section className="mx-auto flex max-w-2xl flex-col items-start gap-4 rounded-3xl border border-dashed border-border px-6 py-10">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">404</p>
          <h1 className="text-3xl font-semibold tracking-tight">这页内容没有找到</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            可能是链接已经变化，或者这篇内容仍处在草稿阶段，还没有公开。
          </p>
          <Link href="/" className="text-sm text-primary underline underline-offset-4">
            返回首页
          </Link>
        </section>
      </MotionReveal>
    </PageShell>
  )
}

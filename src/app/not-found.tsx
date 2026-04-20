import Link from "next/link"
import { AlertOctagon } from "lucide-react"

import { MotionReveal } from "@/components/motion/page-transition"

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a] p-6 font-mono text-amber-500">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-screen"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 animate-pulse bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] opacity-20"
      />

      <MotionReveal variant="scale">
        <section className="relative w-full max-w-2xl border-4 border-red-900 bg-black/80 p-8 shadow-[0_0_50px_rgba(220,38,38,0.2)] md:p-16">
          <div className="mb-8 flex items-center gap-6 border-b-2 border-red-900 pb-8">
            <AlertOctagon className="h-16 w-16 animate-bounce text-red-600" />
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-tighter text-red-600 md:text-6xl">
                Error 404
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.3em] text-red-800">
                Level Inaccessible
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-gray-400 md:text-base">
            <p className="flex items-start gap-4">
              <span className="font-bold text-red-500">&gt;</span>
              You have attempted to enter a space that does not exist in the current architecture.
            </p>
            <p className="flex items-start gap-4">
              <span className="font-bold text-red-500">&gt;</span>
              The corridor ahead is blocked by an infinitely extending concrete wall.
            </p>
            <p className="flex items-start gap-4 text-amber-600">
              <span className="animate-pulse font-bold text-amber-500">!</span>
              Do not remain here. The structure is shifting.
            </p>
          </div>

          <div className="mt-16">
            <Link
              href="/"
              className="inline-flex items-center justify-center border-2 border-green-600 bg-green-800 px-8 py-4 font-sans text-sm font-bold uppercase tracking-widest text-white transition-all shadow-[0_0_20px_rgba(74,222,128,0.2),inset_0_0_15px_rgba(0,0,0,0.5)] hover:scale-105 hover:bg-green-700 active:scale-95"
            >
              Turn Back to The Hub
            </Link>
          </div>
        </section>
      </MotionReveal>
    </div>
  )
}

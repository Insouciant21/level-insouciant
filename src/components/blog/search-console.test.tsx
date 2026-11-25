// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import type { ComponentProps, ReactNode } from "react"
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

vi.mock("@/lib/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/navigation")>()),
  default: ({ children, ...props }: ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      className,
    }: {
      children?: ReactNode
      className?: string
    }) => <div className={className}>{children}</div>,
  },
}))

import { SearchConsole } from "@/components/blog/search-console"

const nativeFetch = globalThis.fetch
const server = setupServer()
let interceptedFetch: typeof fetch

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" })
  interceptedFetch = globalThis.fetch
})

beforeEach(() => {
  globalThis.fetch = (input, init) => {
    const url = new URL(String(input), "http://localhost")
    return interceptedFetch(url, init)
  }
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  globalThis.fetch = interceptedFetch
})

afterAll(() => {
  server.close()
  globalThis.fetch = nativeFetch
})

describe("SearchConsole", () => {
  it("queries immediately and renders dossier details without artificial delay", async () => {
    server.use(
      http.get("http://localhost/api/search", ({ request }) => {
        const q = new URL(request.url).searchParams.get("q")
        expect(q).toBe("level")

        return HttpResponse.json({
          results: [
            {
              archiveCode: "A-0001",
              title: "Level Insouciant",
              desc: "安静的走廊与档案记录。",
              date: "2026-10-12T00:00:00.000Z",
              tags: ["backrooms"],
              category: "世界观档案",
              cover: null,
              draft: false,
              slug: "level-insouciant",
            },
          ],
        })
      })
    )

    render(<SearchConsole />)

    const input = screen.getByLabelText("输入层级标题、编号、分类或标签关键词")
    fireEvent.change(input, { target: { value: "level" } })
    fireEvent.click(screen.getByRole("button", { name: "执行检索" }))

    await screen.findByText("Level Insouciant")
    expect(screen.getByText("A-0001")).toBeTruthy()
    expect(screen.getByText("安静的走廊与档案记录。")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "清空搜索关键词" }))
    await waitFor(() => {
      expect(screen.queryByText("Level Insouciant")).toBeNull()
    })
  })
})

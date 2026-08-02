// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
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

import { ArticleEngagementPanel } from "@/components/blog/article-engagement-panel"
import { QueryProvider } from "@/components/providers/query-provider"

vi.mock("@/components/ui/message-provider", () => ({
  useMessage: () => ({ showMessage: vi.fn() }),
}))

const nativeFetch = globalThis.fetch
const server = setupServer()
let interceptedFetch: typeof fetch

const initialSnapshot = {
  views: 42,
  likes: 3,
  commentsCount: 0,
  likedByViewer: false,
  isAuthenticated: true,
  currentUserName: "Test User",
}

const initialComments = {
  comments: [],
}

function renderPanel() {
  return render(
    <QueryProvider>
      <ArticleEngagementPanel slug="test-article" />
    </QueryProvider>
  )
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" })
  interceptedFetch = globalThis.fetch
})

beforeEach(() => {
  globalThis.fetch = (input, init) => {
    const url = new URL(String(input), "http://localhost")
    return interceptedFetch(url, init)
  }

  server.use(
    http.get("http://localhost/api/articles/test-article/engagement", () =>
      HttpResponse.json(initialSnapshot)
    ),
    http.get("http://localhost/api/articles/test-article/comments", () =>
      HttpResponse.json(initialComments)
    ),
    http.post(
      "http://localhost/api/articles/test-article/engagement/view",
      () => HttpResponse.json({ views: 43 })
    )
  )
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

describe("ArticleEngagementPanel", () => {
  it("caches engagement and comments while the query provider stays mounted", async () => {
    let engagementCalls = 0
    let commentsCalls = 0

    server.use(
      http.get("http://localhost/api/articles/test-article/engagement", () => {
        engagementCalls += 1
        return HttpResponse.json(initialSnapshot)
      }),
      http.get("http://localhost/api/articles/test-article/comments", () => {
        commentsCalls += 1
        return HttpResponse.json(initialComments)
      })
    )

    function Harness({ visible }: { visible: boolean }) {
      return (
        <QueryProvider>
          {visible ? <ArticleEngagementPanel slug="test-article" /> : null}
        </QueryProvider>
      )
    }

    const view = render(<Harness visible />)
    await screen.findByText("43 次阅读")

    view.rerender(<Harness visible={false} />)
    view.rerender(<Harness visible />)
    await screen.findByText("43 次阅读")

    expect(engagementCalls).toBe(1)
    expect(commentsCalls).toBe(1)
  })

  it("updates the like snapshot and inserts a newly returned comment", async () => {
    server.use(
      http.post(
        "http://localhost/api/articles/test-article/engagement/like",
        () => HttpResponse.json({ likes: 4, likedByViewer: true })
      ),
      http.post("http://localhost/api/articles/test-article/comments", () =>
        HttpResponse.json(
          {
            comment: {
              id: "comment-1",
              authorName: "Test User",
              content: "A new comment",
              createdAt: "2026-08-02T00:00:00.000Z",
              parentId: null,
              replyToAuthorName: null,
              replies: [],
            },
          },
          { status: 201 }
        )
      )
    )

    renderPanel()
    const likeButton = await screen.findByRole("button", { name: "3 次点赞" })
    fireEvent.click(likeButton)
    await screen.findByRole("button", { name: "4 次点赞" })

    fireEvent.change(screen.getByLabelText("评论内容"), {
      target: { value: "A new comment" },
    })
    fireEvent.click(screen.getByRole("button", { name: "提交评论" }))

    await screen.findByText("A new comment")
    expect(screen.getByText("1 条已加载")).toBeTruthy()
  })

  it("maps a 401 like response to the existing login message", async () => {
    server.use(
      http.post(
        "http://localhost/api/articles/test-article/engagement/like",
        () => HttpResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 })
      )
    )

    renderPanel()
    fireEvent.click(await screen.findByRole("button", { name: "3 次点赞" }))

    await waitFor(() => {
      expect(screen.getByText("请先登录，再进行点赞。")).toBeTruthy()
    })
  })
})

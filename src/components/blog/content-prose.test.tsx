// @vitest-environment jsdom

import { render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import remarkGfm from "remark-gfm"

import { ContentProse } from "@/components/blog/content-prose"
import { MDXRemote } from "next-mdx-remote/rsc"

vi.mock("next-mdx-remote/rsc", () => ({
  MDXRemote: vi.fn(() => null),
}))

afterEach(() => {
  vi.clearAllMocks()
})

describe("ContentProse", () => {
  it("enables GFM parsing for Markdown strike-through", () => {
    render(<ContentProse source="~~deprecated~~" />)

    const [props] = vi.mocked(MDXRemote).mock.calls.at(-1) ?? []
    const remarkPlugins = (
      props as
        | {
            options?: {
              mdxOptions?: {
                remarkPlugins?: unknown[]
              }
            }
          }
        | undefined
    )?.options?.mdxOptions?.remarkPlugins

    expect(remarkPlugins).toContain(remarkGfm)
  })
})

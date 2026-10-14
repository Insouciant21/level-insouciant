// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { TagAggregateSection } from "@/components/blog/tag-aggregate-section"

afterEach(() => {
  cleanup()
})

describe("TagAggregateSection", () => {
  it("uses the tag heading as the only link to the tag archive", () => {
    const { container } = render(
      <TagAggregateSection
        tag={{
          name: "backrooms",
          slug: "backrooms",
          count: 1,
          articles: [
            {
              archiveCode: "A-0001",
              title: "Level Insouciant",
              desc: "关于一座安静得不合常理的后室层级的开放档案。",
              date: "2026-03-31",
              tags: ["backrooms"],
              category: "档案",
              cover: null,
              draft: false,
              slug: "level-insouciant",
            },
          ],
        }}
      />
    )

    const tagLink = container.querySelector("h2 a")

    expect(tagLink?.getAttribute("href")).toBe("/tags/backrooms")
    expect(tagLink?.textContent).toBe("backrooms")
    expect(
      container.querySelectorAll('a[href="/tags/backrooms"]')
    ).toHaveLength(1)
    expect(container.textContent).not.toContain("查看独立标签页")
    expect(
      container.querySelector('a[href="/articles/level-insouciant"]')
    ).not.toBeNull()
  })
})

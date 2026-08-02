// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

const { useScrollMock, useSpringMock } = vi.hoisted(() => ({
  useScrollMock: vi.fn(),
  useSpringMock: vi.fn(),
}))

vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children?: ReactNode
      [key: string]: unknown
    }) => (
      <div data-testid="reading-progress-fill" {...props}>
        {children}
      </div>
    ),
  },
  useScroll: useScrollMock,
  useSpring: useSpringMock,
}))

import { ArticleReadingSurface } from "@/components/blog/article-reading-surface"

describe("ArticleReadingSurface", () => {
  it("binds the progress bar to the article target with Motion offsets", () => {
    const scrollProgress = { get: () => 0.5 }
    useScrollMock.mockReturnValue({ scrollYProgress: scrollProgress })
    useSpringMock.mockImplementation((value: unknown) => value)

    render(
      <ArticleReadingSurface>
        <p>Article body</p>
      </ArticleReadingSurface>
    )

    expect(screen.getByRole("article").textContent).toContain("Article body")
    expect(useScrollMock).toHaveBeenCalledWith({
      target: expect.any(Object),
      offset: ["start 96px", "end 35vh"],
    })
    expect(useSpringMock).toHaveBeenCalledWith(
      scrollProgress,
      expect.objectContaining({ stiffness: expect.any(Number) })
    )
  })
})

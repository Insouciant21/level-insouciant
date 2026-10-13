import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react"

import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CodeBlockFigureProps = {
  children: ReactNode
}

type ElementWithProps = ReactElement<Record<string, unknown>>

function isElementWithProps(node: ReactNode): node is ElementWithProps {
  return isValidElement(node)
}

function getNodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join("")
  }

  if (isElementWithProps(node)) {
    return getNodeText((node.props.children ?? "") as ReactNode)
  }

  return ""
}

function getLanguageLabel(
  preElement: ReactElement<{ [key: string]: unknown }>
) {
  const directLanguage = preElement.props["data-language"]

  if (typeof directLanguage === "string" && directLanguage.length > 0) {
    return directLanguage
  }

  const childNode = (preElement.props.children ?? null) as ReactNode

  if (isElementWithProps(childNode)) {
    const nestedLanguage = childNode.props["data-language"]

    if (typeof nestedLanguage === "string" && nestedLanguage.length > 0) {
      return nestedLanguage
    }

    const className = childNode.props.className

    if (typeof className === "string") {
      const match = className.match(/language-([a-z0-9+-]+)/i)

      if (match?.[1]) {
        return match[1]
      }
    }
  }

  return "text"
}

function CodeBlockFigure({ children }: CodeBlockFigureProps) {
  const nodes = Children.toArray(children)
  const preNode = nodes.find(
    (node) => isElementWithProps(node) && node.type === "pre"
  )
  const titleNode = nodes.find(
    (node) =>
      isElementWithProps(node) && "data-rehype-pretty-code-title" in node.props
  )

  if (!preNode || !isElementWithProps(preNode)) {
    return <figure className="my-8 max-w-full">{children}</figure>
  }

  const code = getNodeText((preNode.props.children ?? "") as ReactNode).replace(
    /\n$/,
    ""
  )
  const title = titleNode ? getNodeText(titleNode) : ""
  const language = getLanguageLabel(preNode)
  const label = title || language

  return (
    <figure className="code-block my-8 w-full max-w-full overflow-hidden rounded-md border shadow-[0_28px_80px_-45px_rgba(20,16,13,0.3)]">
      <div className="code-block-toolbar flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="code-block-label truncate font-mono text-xs tracking-[0.12em] uppercase">
            {label}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          data-copy-code={code}
          data-copied="false"
          aria-label="复制代码"
          className="code-block-copy-button group h-8 rounded-full border px-3"
        >
          <Copy className="size-4 group-data-[copied=true]:hidden" />
          <Check className="hidden size-4 group-data-[copied=true]:block" />
          <span data-copy-label>复制</span>
        </Button>
      </div>

      {cloneElement(preNode, {
        className: cn(
          "code-block-pre w-full max-w-full",
          preNode.props.className as string | undefined
        ),
      })}
    </figure>
  )
}

export { CodeBlockFigure }

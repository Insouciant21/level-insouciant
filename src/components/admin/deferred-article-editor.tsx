import {
  useEffect,
  useState,
  type ComponentType,
  type ComponentProps,
} from "react"
import { LoaderCircle } from "lucide-react"
import type { ArticleRichEditor } from "@/components/admin/article-rich-editor"
import type { MdxEditor } from "@/components/admin/mdx-editor"

const loadRichEditor = () =>
  import("./article-rich-editor").then((module) => module.ArticleRichEditor)
const loadMdxEditor = () =>
  import("./mdx-editor").then((module) => module.MdxEditor)

function DeferredEditor<
  Props extends { value: string; onChange: (value: string) => void },
>({
  load,
  editorProps,
}: {
  load: () => Promise<ComponentType<Props>>
  editorProps: Props
}) {
  const [Editor, setEditor] = useState<ComponentType<Props> | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    load().then(
      (component) => {
        if (!cancelled) setEditor(() => component)
      },
      () => {
        if (!cancelled) setFailed(true)
      }
    )
    return () => {
      cancelled = true
    }
  }, [load])

  if (Editor) return <Editor {...editorProps} />

  if (failed) {
    return (
      <div className="p-5 text-sm text-[#9aa79a]">
        <p role="status" className="mb-3">
          编辑器加载失败，已保留内容，可继续使用下方源码输入框编辑和保存。
        </p>
        <textarea
          aria-label="临时源码编辑器"
          className="admin-input min-h-[30rem] w-full font-mono"
          value={editorProps.value}
          onChange={(event) => editorProps.onChange(event.target.value)}
        />
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[30rem] flex-col items-center justify-center gap-3 px-5 text-sm text-[#9aa79a]"
    >
      <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
      <p>正在加载编辑器…</p>
      <p className="text-xs">首次加载可能需要一些时间，可先填写文章元数据。</p>
    </div>
  )
}

export function DeferredRichEditor(
  props: ComponentProps<typeof ArticleRichEditor>
) {
  return <DeferredEditor load={loadRichEditor} editorProps={props} />
}

export function DeferredMdxEditor(props: ComponentProps<typeof MdxEditor>) {
  return <DeferredEditor load={loadMdxEditor} editorProps={props} />
}

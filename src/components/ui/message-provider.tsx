"use client"

import * as React from "react"
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import { Toast } from "radix-ui"

import { cn } from "@/lib/utils"

type MessageTone = "success" | "error" | "warning" | "info"

type MessagePayload = {
  title: string
  description?: string
  tone?: MessageTone
}

type ActiveMessage = MessagePayload & {
  id: number
  tone: MessageTone
}

type MessageContextValue = {
  showMessage: (message: MessagePayload) => void
}

const MessageContext = React.createContext<MessageContextValue | null>(null)

const toneIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
} satisfies Record<MessageTone, React.ComponentType<{ className?: string }>>

const adminNoticeMessages = {
  "article-draft-created": {
    title: "草稿已创建",
    description: "文章已写入数据库，并生成了第一条修订记录。",
    tone: "success",
  },
  "article-created": {
    title: "文章已创建",
    description: "文章已写入数据库，并生成了第一条修订记录。",
    tone: "success",
  },
  "article-draft-saved": {
    title: "草稿已保存",
    description: "已生成新的修订记录，后台数据已同步。",
    tone: "success",
  },
  "article-saved": {
    title: "文章已保存",
    description: "已生成新的修订记录，后台数据已同步。",
    tone: "success",
  },
  "article-published": {
    title: "文章已发布",
    description: "公开页面、索引和后台统计已经重新校验。",
    tone: "success",
  },
  "article-hidden": {
    title: "文章已下线",
    description: "前台内容和后台列表已经同步更新。",
    tone: "warning",
  },
  "article-deleted": {
    title: "文章已删除",
    description: "关联的阅读、点赞、评论和修订记录已一并清理。",
    tone: "warning",
  },
  "comment-approved": {
    title: "评论已恢复显示",
    description: "评论区与后台统计已经同步。",
    tone: "success",
  },
  "comment-hidden": {
    title: "评论已隐藏",
    description: "这条评论及其回复状态已经更新。",
    tone: "warning",
  },
  "comment-deleted": {
    title: "评论已删除",
    description: "评论区与后台统计已经同步。",
    tone: "warning",
  },
  "tag-renamed": {
    title: "标签已重命名",
    description: "相关文章、归档索引和后台列表已经刷新。",
    tone: "success",
  },
  "tag-removed": {
    title: "标签已移除",
    description: "相关文章、归档索引和后台列表已经刷新。",
    tone: "warning",
  },
  "revision-restored": {
    title: "历史版本已恢复",
    description: "当前文章已同步生成新的修订记录。",
    tone: "success",
  },
  "site-settings-saved": {
    title: "站点设置已保存",
    description: "站点身份、页面内容和 SEO 配置已同步。",
    tone: "success",
  },
  "site-favicon-saved": {
    title: "站点图标已更新",
    description: "新的 PNG、ICO 和多尺寸图标已经生成。",
    tone: "success",
  },
} satisfies Record<string, MessagePayload>

const accountMessages = {
  profile: {
    title: "个人资料已更新",
    description: "账号资料已经保存。",
    tone: "success",
  },
  password: {
    title: "密码已更新",
    description: "新的登录凭据已经生效。",
    tone: "success",
  },
  comment: {
    title: "评论已删除",
    description: "你的评论记录已经更新。",
    tone: "warning",
  },
} satisfies Record<string, MessagePayload>

const errorMessages: Record<string, string> = {
  ARTICLE_NOT_FOUND: "没有找到这篇文章。",
  ARTICLE_SLUG_TAKEN: "这个 slug 已经存在了，请换一个新的。",
  COMMENT_HAS_REPLIES: "这条评论下还有回复，暂时不能直接删除。",
  COMMENT_NOT_FOUND: "这条评论不存在或已经被删除。",
  DATABASE_NOT_CONFIGURED: "数据库尚未配置完成，操作暂时无法完成。",
  EMAIL_TAKEN: "这个邮箱已经被其他账号占用。",
  FORBIDDEN: "你没有权限执行这个操作。",
  INVALID_ARTICLE_INPUT: "文章信息不完整，请补全必填内容。",
  INVALID_CREDENTIALS: "邮箱或密码不正确。",
  INVALID_CURRENT_PASSWORD: "原密码验证失败。",
  INVALID_PASSWORD_INPUT: "新密码至少需要 8 位字符。",
  INVALID_PROFILE_INPUT: "请至少填写有效邮箱后再保存资料。",
  INVALID_FAVICON_UPLOAD: "请上传有效的 PNG 或 ICO 图标文件。",
  INVALID_SITE_SETTINGS: "站点设置格式无效，请检查后再保存。",
  INVALID_TAG: "标签内容无效，请检查后再提交。",
  PASSWORD_CONFIRM_MISMATCH: "两次输入的新密码不一致。",
  REVISION_NOT_FOUND: "这条修订记录不存在，可能已经被删除。",
  SITE_SETTINGS_SAVE_FAILED: "站点设置保存失败，请稍后再试。",
  FAVICON_SAVE_FAILED: "站点图标生成或保存失败，请稍后再试。",
  USER_NOT_FOUND: "没有找到当前账号。",
}

function isAdminNoticeKey(value: string): value is keyof typeof adminNoticeMessages {
  return value in adminNoticeMessages
}

function getRouteMessage(pathname: string, searchParams: URLSearchParams): MessagePayload | null {
  const notice = searchParams.get("notice")

  if (pathname.startsWith("/admin") && notice && isAdminNoticeKey(notice)) {
    return adminNoticeMessages[notice]
  }

  if (pathname.startsWith("/admin") && searchParams.has("created")) {
    return adminNoticeMessages["article-created"]
  }

  if (pathname.startsWith("/admin") && searchParams.has("saved")) {
    return adminNoticeMessages["article-saved"]
  }

  if (pathname.startsWith("/admin") && searchParams.has("restored")) {
    return adminNoticeMessages["revision-restored"]
  }

  for (const [key, message] of Object.entries(accountMessages)) {
    if ((pathname === "/account" || pathname === "/admin/account") && searchParams.has(key)) {
      return message
    }
  }

  const error = searchParams.get("error")

  if ((pathname.startsWith("/admin") || pathname === "/account") && error) {
    return {
      title: "操作失败",
      description: errorMessages[error] ?? "操作失败，请稍后再试。",
      tone: "error" satisfies MessageTone,
    }
  }

  return null
}

function MessageRouteAnnouncer() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { showMessage } = useMessage()
  const query = searchParams.toString()
  const lastMessageKey = React.useRef<string | null>(null)

  React.useEffect(() => {
    const message = getRouteMessage(pathname, new URLSearchParams(query))

    if (!message) {
      return
    }

    const key = `${pathname}?${query}`

    if (lastMessageKey.current === key) {
      return
    }

    lastMessageKey.current = key
    showMessage(message)
  }, [pathname, query, showMessage])

  return null
}

function MessageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [message, setMessage] = React.useState<ActiveMessage | null>(null)
  const [open, setOpen] = React.useState(false)
  const nextMessageId = React.useRef(0)
  const isAdminRoute = pathname.startsWith("/admin")

  const showMessage = React.useCallback((payload: MessagePayload) => {
    nextMessageId.current += 1
    setMessage({
      ...payload,
      id: nextMessageId.current,
      tone: payload.tone ?? "info",
    })
    setOpen(true)
  }, [])

  const contextValue = React.useMemo(
    () => ({ showMessage }),
    [showMessage]
  )

  const Icon = message ? toneIcons[message.tone] : Info

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
      <React.Suspense fallback={null}>
        <MessageRouteAnnouncer />
      </React.Suspense>
      <Toast.Provider swipeDirection="right" duration={4600}>
        {message ? (
          <Toast.Root
            key={message.id}
            data-message-toast=""
            data-surface={isAdminRoute ? "admin" : "public"}
            data-tone={message.tone}
            open={open}
            onOpenChange={setOpen}
            className={cn(
              "pointer-events-auto grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border px-4 py-4 shadow-[0_24px_48px_-30px_rgba(0,0,0,0.5)] outline-none transition data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
              isAdminRoute
                ? "border-[#333333] bg-[#111111] text-[#e0e0e0]"
                : "border-[#73766f]/55 bg-[#d9d1ad]/95 text-foreground shadow-[inset_0_1px_0_rgba(255,252,225,0.22),0_24px_48px_-34px_rgba(0,0,0,0.42)]"
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 size-4",
                isAdminRoute
                  ? message.tone === "error"
                    ? "text-[#ff8d82]"
                    : message.tone === "warning"
                      ? "text-[#f59e0b]"
                      : "text-[var(--safety-exit-green-strong)]"
                  : message.tone === "error"
                    ? "text-[#8a4f34]"
                    : message.tone === "warning"
                      ? "text-[#c58b2f]"
                      : "text-primary-foreground"
              )}
            />
            <div className="min-w-0">
              <Toast.Title
                className={cn(
                  "text-sm font-semibold uppercase tracking-[0.22em]",
                  isAdminRoute ? "text-[#e0e0e0]" : "text-foreground"
                )}
              >
                {message.title}
              </Toast.Title>
              {message.description ? (
                <Toast.Description
                  className={cn(
                    "mt-2 text-sm leading-6",
                    isAdminRoute ? "text-[#8c8c8c]" : "text-muted-foreground"
                  )}
                >
                  {message.description}
                </Toast.Description>
              ) : null}
            </div>
            <Toast.Close
              aria-label="关闭消息"
              className={cn(
                "inline-flex size-7 items-center justify-center border transition",
                isAdminRoute
                  ? "border-[#333333] text-[#8c8c8c] hover:bg-[#1a1a1a] hover:text-[#e0e0e0]"
                  : "border-[#73766f]/45 bg-[#d9d1ad]/50 text-muted-foreground hover:bg-[#c6bd99]/62 hover:text-foreground"
              )}
            >
              <X className="size-3.5" />
            </Toast.Close>
          </Toast.Root>
        ) : null}
        <Toast.Viewport className="fixed right-4 top-4 z-[90] grid w-[calc(100vw-2rem)] max-w-sm gap-3 sm:right-6 sm:top-6" />
      </Toast.Provider>
    </MessageContext.Provider>
  )
}

function useMessage() {
  const context = React.useContext(MessageContext)

  if (!context) {
    throw new Error("useMessage must be used within MessageProvider")
  }

  return context
}

export { MessageProvider, useMessage, type MessagePayload, type MessageTone }

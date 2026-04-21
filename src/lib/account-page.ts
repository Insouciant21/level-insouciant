export type AccountPageSearchParams = {
  profile?: string
  password?: string
  comment?: string
  error?: string
}

const accountErrorMessages: Record<string, string> = {
  DATABASE_NOT_CONFIGURED: "数据库尚未配置完成，账号信息暂时无法修改。",
  INVALID_PROFILE_INPUT: "请至少填写有效邮箱后再保存资料。",
  EMAIL_TAKEN: "这个邮箱已经被其他账号占用。",
  INVALID_PASSWORD_INPUT: "新密码至少需要 8 位字符。",
  PASSWORD_CONFIRM_MISMATCH: "两次输入的新密码不一致。",
  INVALID_CURRENT_PASSWORD: "原密码验证失败。",
  COMMENT_NOT_FOUND: "这条评论不存在或已经被删除。",
  FORBIDDEN: "你只能管理自己发出的评论。",
  COMMENT_HAS_REPLIES: "这条评论下还有回复，暂时不能直接删除。",
}

export function getAccountPath(role: "ADMIN" | "USER") {
  return role === "ADMIN" ? "/admin/account" : "/account"
}

export function getAccountNotice(params: AccountPageSearchParams) {
  if (params.profile) {
    return "个人资料已更新。"
  }

  if (params.password) {
    return "密码已更新。"
  }

  if (params.comment) {
    return "评论已删除。"
  }

  if (params.error) {
    return accountErrorMessages[params.error] ?? "操作失败，请稍后再试。"
  }

  return null
}

export function formatAccountCommentDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

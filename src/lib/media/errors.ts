const MEDIA_ERROR_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: "登录状态已失效，请重新登录。",
  INVALID_MEDIA_DISPLAY_NAME: "请输入有效的媒体显示名称。",
  INVALID_MEDIA_FILE: "请选择一张图片文件。",
  INVALID_MEDIA_TYPE: "仅支持 JPG、PNG、WebP 和 GIF 图片。",
  MEDIA_ASSET_NOT_AVAILABLE: "这张图片当前不可操作。",
  MEDIA_ASSET_NOT_FOUND: "媒体资源不存在，可能已被删除。",
  MEDIA_ASSET_NOT_RETRYABLE: "这张图片当前不能重试删除。",
  MEDIA_FILE_TOO_LARGE: "图片不能超过 50 MB。",
  MEDIA_REFERENCE_REWRITE_FAILED: "文章图片引用清理失败，请稍后重试。",
  MEDIA_REQUEST_FAILED: "媒体操作失败，请稍后重试。",
  MEDIA_STORAGE_NOT_CONFIGURED: "图片存储尚未配置，请联系管理员。",
}

export function getMediaErrorMessage(
  error: unknown,
  fallback = "媒体操作失败，请稍后重试。"
): string {
  const code = error instanceof Error ? error.message : String(error ?? "")

  return MEDIA_ERROR_MESSAGES[code] ?? fallback
}

export { MEDIA_ERROR_MESSAGES }

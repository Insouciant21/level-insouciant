export function slugifySegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function decodeRouteSegment(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

import type { ArchiveItem } from "@/types/blog"
export function toArchiveSlug(value: string) {
  return slugifySegment(decodeRouteSegment(value))
}
export function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function getArchiveHref(
  type: "tags" | "categories",
  item: Pick<ArchiveItem, "slug">
) {
  return `/${type}/${item.slug}`
}

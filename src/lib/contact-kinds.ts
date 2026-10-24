import type { ComponentType } from "react"
import {
  Gamepad2,
  Globe2,
  Link as LinkIcon,
  Mail,
  Music2,
  Tv2,
} from "lucide-react"

import {
  GithubBrandIcon,
  LinkedinBrandIcon,
  TwitterBrandIcon,
} from "@/lib/brand-icons"
import type { ContactKind } from "@/lib/site"

export type ContactIcon = ComponentType<{ className?: string }>

export type ContactKindOption = {
  value: ContactKind
  label: string
  icon: ContactIcon
}

export const contactKindOptions = [
  { value: "github", label: "GitHub", icon: GithubBrandIcon },
  { value: "email", label: "Email", icon: Mail },
  { value: "steam", label: "Steam", icon: Gamepad2 },
  { value: "twitter", label: "Twitter", icon: TwitterBrandIcon },
  { value: "linkedin", label: "LinkedIn", icon: LinkedinBrandIcon },
  { value: "netease", label: "网易云音乐", icon: Music2 },
  { value: "bilibili", label: "哔哩哔哩", icon: Tv2 },
  { value: "website", label: "网站", icon: Globe2 },
  { value: "custom", label: "自定义", icon: LinkIcon },
] as const satisfies readonly ContactKindOption[]

export const contactIconByKind: Record<ContactKind, ContactIcon> = {
  github: GithubBrandIcon,
  email: Mail,
  steam: Gamepad2,
  twitter: TwitterBrandIcon,
  linkedin: LinkedinBrandIcon,
  netease: Music2,
  bilibili: Tv2,
  website: Globe2,
  custom: LinkIcon,
}

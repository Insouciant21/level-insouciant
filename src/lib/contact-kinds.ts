import {
  Gamepad2,
  Github,
  Globe2,
  Link as LinkIcon,
  Linkedin,
  Mail,
  Music2,
  Tv2,
  Twitter,
  type LucideIcon,
} from "lucide-react"

import type { ContactKind } from "@/lib/site"

export type ContactKindOption = {
  value: ContactKind
  label: string
  icon: LucideIcon
}

export const contactKindOptions = [
  { value: "github", label: "GitHub", icon: Github },
  { value: "email", label: "Email", icon: Mail },
  { value: "steam", label: "Steam", icon: Gamepad2 },
  { value: "twitter", label: "Twitter", icon: Twitter },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "netease", label: "网易云音乐", icon: Music2 },
  { value: "bilibili", label: "哔哩哔哩", icon: Tv2 },
  { value: "website", label: "网站", icon: Globe2 },
  { value: "custom", label: "自定义", icon: LinkIcon },
] as const satisfies readonly ContactKindOption[]

export const contactIconByKind: Record<ContactKind, LucideIcon> = {
  github: Github,
  email: Mail,
  steam: Gamepad2,
  twitter: Twitter,
  linkedin: Linkedin,
  netease: Music2,
  bilibili: Tv2,
  website: Globe2,
  custom: LinkIcon,
}

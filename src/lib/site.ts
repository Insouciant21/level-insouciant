export type ContactKind =
  | "github"
  | "email"
  | "steam"
  | "twitter"
  | "linkedin"
  | "netease"
  | "bilibili"
  | "website"
  | "custom"

export type SiteLink = {
  id: string
  kind: ContactKind
  label: string
  value: string
  href: string
  enabled: boolean
}

type SiteAction = {
  label: string
  href: string
}

export type SiteConfigData = {
  name: string
  description: string
  author: string
  email: string
  url: string
  hero: {
    eyebrow: string
    title: string
    primaryAction: SiteAction
    secondaryAction: SiteAction
  }
  about: {
    metadataTitle: string
    metadataDescription: string
    displayTitle: string
    archiveNodeLabel: string
    statusLabel: string
    statusValue: string
    quote: string
    intro: string
    principles: string
    contactHeading: string
    archiveAccess: SiteAction
    transmission: SiteAction
  }
  profile: {
    title: string
    summary: string
    status: string
    location: string
  }
  contacts: SiteLink[]
  footer: {
    links: SiteLink[]
  }
  seo: {
    keywords: string[]
    defaultOgImageAlt: string
  }
}

export type SiteConfig = SiteConfigData & {
  locale: string
  language: string
  nav: Array<{
    href: string
    label: string
  }>
  socials: Array<{
    label: string
    href: string
    description: string
  }>
}

const defaultEmail = "insouciant21@outlook.com"

export const defaultSiteConfig: SiteConfig = {
  name: "Level Insouciant",
  description: "一间过于安静的房间",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://level-insouciant.local",
  author: "Insouciant21",
  email: defaultEmail,
  locale: "zh_CN",
  language: "zh-CN",
  nav: [
    { href: "/", label: "首页" },
    { href: "/articles", label: "档案" },
    { href: "/search", label: "搜索" },
    { href: "/tags", label: "标签" },
    { href: "/categories", label: "分类" },
    { href: "/about", label: "须知" },
  ],
  hero: {
    eyebrow: "Archive Notes",
    title: "Level Insouciant",
    primaryAction: {
      href: "/articles",
      label: "进入层级档案",
    },
    secondaryAction: {
      href: "/about",
      label: "阅读生存须知",
    },
  },
  about: {
    metadataTitle: "生存须知",
    metadataDescription: "关于层级维护者、记录方式与持续更新的说明。",
    displayTitle: "Moeblue",
    archiveNodeLabel: "Level Insouciant",
    statusLabel: "Status",
    statusValue: "Operational",
    quote: "To map the unmappable. To survive the unlivable. To record what was meant to be forgotten.",
    intro:
      "这里不是普通的个人主页，而是我为 Level Insouciant 维护的一份开放档案。经验、日常与学习在这里被整理成可复查的路径。",
    principles:
      "我把这座站点当成一份会持续演化的开放档案，技术与经验会被放进同一套秩序里，因为它们本质上都在处理同一个问题：如何给后来者留下可信的路径标记。",
    contactHeading: "Contact Information",
    archiveAccess: {
      label: "Archive Access",
      href: "/articles",
    },
    transmission: {
      label: "Transmission",
      href: `mailto:${defaultEmail}`,
    },
  },
  profile: {
    title: "记录者摘要",
    summary:
      "我是这份档案的长期维护者，也是一个正在学习的开发者。遇到难以解释的房间时，我更习惯先整理命名、边界和证据，再决定要不要继续深入。",
    status: "持续记录中",
    location: "China",
  },
  contacts: [
    {
      id: "github",
      kind: "github",
      label: "GitHub",
      value: "github.com/Insouciant21",
      href: "https://github.com/Insouciant21",
      enabled: true,
    },
    {
      id: "email",
      kind: "email",
      label: "Email",
      value: defaultEmail,
      href: `mailto:${defaultEmail}`,
      enabled: true,
    },
    {
      id: "steam",
      kind: "steam",
      label: "Steam",
      value: "https://steamcommunity.com/id/insouciant21/",
      href: "https://steamcommunity.com/id/insouciant21/",
      enabled: true,
    },
  ],
  socials: [
    {
      label: "联系",
      href: `mailto:${defaultEmail}`,
      description: "发邮件交换目击记录或写作线索",
    },
    {
      label: "须知",
      href: "/about",
      description: "查看维护者说明与记录原则",
    },
    {
      label: "档案",
      href: "/articles",
      description: "浏览公开层级记录与观察笔记",
    },
  ],
  footer: {
    links: [
      {
        id: "contact",
        kind: "email",
        label: "联系",
        value: "发邮件交换目击记录或写作线索",
        href: `mailto:${defaultEmail}`,
        enabled: true,
      },
      {
        id: "about",
        kind: "website",
        label: "须知",
        value: "查看维护者说明与记录原则",
        href: "/about",
        enabled: true,
      },
      {
        id: "archive",
        kind: "website",
        label: "档案",
        value: "浏览公开层级记录与观察笔记",
        href: "/articles",
        enabled: true,
      },
    ],
  },
  seo: {
    keywords: ["博客", "Backrooms", "技术", "日记", "前端", "后端", "写作", "档案"],
    defaultOgImageAlt: "Level Insouciant archive cover",
  },
}

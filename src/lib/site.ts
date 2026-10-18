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
  url: "https://blog.moeblue.top",
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
      "这里不只是一张个人主页，也是一份持续整理中的开放档案。Level Insouciant 记录经验、日常与学习，并将零散的经历整理成可以回看、验证和继续延伸的路径。",
    principles:
      "我希望这个站点在不断记录中逐渐形成自己的秩序。技术、经验，以及那些暂时没有答案的问题，都会在这里留下痕迹；如果这些记录能为后来者提供一些线索，它们便有了继续存在的意义。",
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
      "我是这份档案的维护者，也是一名仍在学习中的开发者。面对一时难以解释的房间，我习惯先理清名称、边界与证据，再决定是否继续深入。",
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

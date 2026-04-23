export const siteConfig = {
  name: "Level Insouciant",
  description: "记录从容、回声与失真的秩序",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://level-insouciant.local",
  author: "Insouciant21",
  email: "insouciant21@outlook.com",
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
    description:
      "这里收集关于技术、日常与学习的记录，也把经验压进同一份档案里。",
    note:
      "如果这是你第一次抵达这里，建议先阅读《Level Insouciant》，再决定是否继续向里走。",
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
    intro:
      "这里不是普通的个人主页，而是我为 Level Insouciant 维护的一份开放档案。经验、日常与学习在这里被整理成可复查的路径。",
    highlights: [
      "优先记录会重复出现的结构，而不是只记录最显眼的异常。",
      "如果某条走廊比上一次更安静，先怀疑记忆被修订，而不是地图错了。",
      "所有公开档案既是写作练习，也是留给后来者的路径标记。",
    ],
  },
  profile: {
    title: "记录者摘要",
    summary:
      "我是这份档案的长期维护者，也是一个正在学习的开发者。遇到难以解释的房间时，我更习惯先整理命名、边界和证据，再决定要不要继续深入。",
    status: "持续记录中",
    location: "China",
    focuses: [
      "记录层级里的重复灯光、走廊与不合时宜的回声",
      "把界面设计、组件边界与档案结构整理成可复查的系统",
      "为后来抵达的人留下足够诚实的说明，而不是夸张的传奇",
    ],
  },
  socials: [
    {
      label: "联系",
      href: "mailto:insouciant21@outlook.com",
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
    closing: "如果你在一间过于安静的房间里读到这些文字，说明档案仍在更新。",
  },
  seo: {
    keywords: ["博客", "Backrooms", "技术", "日记", "前端", "后端", "写作", "档案"],
    defaultOgImageAlt: "Level Insouciant archive cover",
  },
} as const

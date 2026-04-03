export const siteConfig = {
  name: "Insous World",
  description: "一个面向技术文章与个人随笔的极简个人博客。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://insous.local",
  author: "Insouciant21",
  email: "tom2964318290@gmail.com",
  locale: "zh_CN",
  language: "zh-CN",
  nav: [
    { href: "/", label: "首页" },
    { href: "/articles", label: "博客" },
    { href: "/search", label: "搜索" },
    { href: "/tags", label: "标签" },
    { href: "/categories", label: "分类" },
    { href: "/about", label: "关于" },
  ],
  hero: {
    eyebrow: "技术文章 / 个人随笔",
    title: "记录构建、书写与长期主义。",
    description:
      "这里收集我关于前端开发、产品思考和日常观察的笔记，用清晰的结构留下可回看的痕迹。",
    note: "从前端系统、写作方法到长期维护的产品判断，持续更新，慢慢变厚。",
    primaryAction: {
      href: "/articles",
      label: "阅读最新文章",
    },
    secondaryAction: {
      href: "/about",
      label: "了解作者",
    },
  },
  about: {
    intro:
      "我关注清晰的界面、长期可维护的前端系统，以及写作如何帮助人把想法沉淀下来。",
    highlights: [
      "偏爱可读性高、约束清晰的产品和代码。",
      "把博客视为公开的学习档案，而不是一次性的发布渠道。",
      "希望文章既能服务未来的自己，也能顺手帮到路过的读者。",
    ],
  },
  profile: {
    title: "自我介绍",
    summary:
      "我是一个偏爱长期主义的前端开发者，喜欢把复杂问题拆成可维护的结构，也喜欢把工作过程写成能反复回看的文字。",
    status: "长期更新中",
    location: "China / Remote",
    focuses: [
      "前端系统设计与组件边界",
      "可读性、节奏感与界面细节",
      "用写作沉淀决策、问题与方法",
    ],
  },
  socials: [
    {
      label: "Email",
      href: "mailto:tom2964318290@gmail.com",
      description: "发邮件聊项目或写作",
    },
    {
      label: "About",
      href: "/about",
      description: "查看更多背景与方法",
    },
    {
      label: "Archive",
      href: "/articles",
      description: "浏览公开文章归档",
    },
  ],
  footer: {
    closing: "写作是公开的长期记忆。",
  },
  seo: {
    keywords: ["技术博客", "前端开发", "写作", "系统设计", "个人随笔"],
    defaultOgImageAlt: "Insous World blog cover",
  },
} as const

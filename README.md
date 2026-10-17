# Level Insouciant

[English](./README.en.md)

Level Insouciant 是一个基于 Astro 和 PostgreSQL 的自托管小型博客 CMS。它同时提供面向读者的响应式博客和面向维护者的管理后台，适合作为个人博客直接部署，也可以作为内容型网站的二次开发基础。

在线演示：[blog.moeblue.top](https://blog.moeblue.top)

## 功能

- 使用 Markdown/MDX 编写文章，支持 GFM、数学公式、代码高亮和文章目录。
- 文章草稿、分类、标签、全文搜索、修订历史和封面管理。
- 响应式首页、归档、文章、分类、标签、搜索和关于页面。
- 自动生成 Sitemap、RSS、robots.txt 和 Open Graph 图片。
- 用户注册与登录、个人资料、评论与回复、点赞和阅读统计。
- 管理后台提供文章、评论、标签、媒体、统计和站点设置管理。
- 媒体文件可存储在阿里云 OSS、腾讯云 COS 或 Cloudflare R2。
- 支持通过 Docker Compose 部署，并在 Web 服务启动前自动执行 Prisma 迁移。

## 技术栈

- Astro 7 SSR + Node adapter、React 19、TypeScript
- Tailwind CSS 4、Radix UI、Motion
- Tiptap、CodeMirror、MDX
- PostgreSQL、Prisma 7
- Auth.js Core
- Vitest、Testing Library、ESLint
- pnpm 11、Docker Compose

## 快速开始

你可以使用 Docker Compose 直接部署，也可以在本机运行开发环境。两种方式都需要 PostgreSQL。

### 本地开发

要求 Node.js 24、pnpm 11 和可访问的 PostgreSQL 数据库。

```bash
git clone https://github.com/Insouciant21/level-insouciant.git
cd level-insouciant
corepack enable
pnpm install
cp .env.example .env
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```

开发服务器默认运行在 <http://localhost:4321>。本地开发时请将 `SITE_URL` 设置为实际访问地址。

## 环境变量

`.env.example` 提供了不含真实凭据的配置模板。`.env` 已被 Git 忽略，不要提交任何密码、访问密钥或生产地址中的敏感参数。

### 应用与认证

| 变量                     | 必需 | 说明                                                                              |
| ------------------------ | ---- | --------------------------------------------------------------------------------- |
| `DATABASE_URL`           | 是   | PostgreSQL 连接地址，应用运行和默认迁移连接使用。                                 |
| `DIRECT_URL`             | 否   | 迁移专用直连地址，适用于运行时使用连接池地址的数据库服务。                        |
| `SITE_URL`   | 是   | 对外访问的完整站点地址，用于 SEO；修改后重启服务。兼容旧的 `NEXT_PUBLIC_SITE_URL`。 |
| `AUTH_SECRET`            | 是   | Auth.js 用于保护会话和令牌的随机密钥。                                            |
| `ADMIN_EMAIL`            | 是   | 初始管理员邮箱。                                                                  |
| `ADMIN_PASSWORD`         | 是   | 初始管理员密码。首次使用这组凭据登录时创建管理员。                                |
| `DATABASE_HOST_OVERRIDE` | 否   | 容器运行时替换 `DATABASE_URL` 主机；Compose 已设置为 `postgresql`。               |
| `DATABASE_NAME_OVERRIDE` | 否   | 容器运行时替换数据库名；Compose 已设置为 `level-insouciant`。                     |

`ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 只用于按需创建初始管理员：当数据库中不存在该邮箱，并且首次登录提交的凭据与环境变量一致时，系统创建管理员账号。账号创建后，修改环境变量不会修改数据库中的现有密码；请在后台账号页面维护账号信息。

### 媒体存储

设置 `MEDIA_STORAGE_PROVIDER` 为 `oss`、`cos` 或 `r2`，并填写对应的一组变量。未配置媒体存储时，博客和文章管理仍可运行，但后台上传图片会失败并显示配置提示。

| 提供商        | 变量                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 阿里云 OSS    | `OSS_REGION`、`OSS_BUCKET`、`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`、`OSS_PUBLIC_BASE_URL`；`OSS_ENDPOINT` 可选。 |
| 腾讯云 COS    | `COS_REGION`、`COS_BUCKET`、`COS_SECRET_ID`、`COS_SECRET_KEY`、`COS_PUBLIC_BASE_URL`。                                 |
| Cloudflare R2 | `R2_ACCOUNT_ID`、`R2_BUCKET`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_PUBLIC_BASE_URL`；`R2_ENDPOINT` 可选。   |

`*_PUBLIC_BASE_URL` 应指向能够公开读取文件的域名，末尾斜杠可省略。

## 初始管理员

完成数据库迁移后访问 `/admin/login`，使用 `.env` 中的 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 登录。首次成功验证时系统会创建 `ADMIN` 用户。完成首次登录后建议立即在后台修改密码，并同步更换部署环境中的引导密码，避免旧凭据再次被误用。

普通用户可以从 `/register` 注册；初始管理员邮箱被保留，不能通过普通注册流程占用。

## 文章导入

后台可以直接创建和编辑文章。项目还提供批量导入脚本，它优先读取 `content/article-seeds/`，不存在时读取 `content/articles/`，并按照 `slug` 更新或创建文章：

```bash
pnpm articles:import
```

每个 `.mdx` 文件需要包含以下 frontmatter：

```mdx
---
title: 示例文章
desc: 文章摘要
date: 2026-08-05
tags:
  - Astro
category: 技术
cover: ""
draft: true
slug: example-post
---

文章正文。
```

`content/` 默认被 Git 忽略，适合保存本机导入源文件；正式文章数据存储在 PostgreSQL 中。

## 常用命令

| 命令                              | 用途                                   |
| --------------------------------- | -------------------------------------- |
| `pnpm dev`                        | 启动开发服务器。                       |
| `pnpm build`                      | 创建生产构建。                         |
| `pnpm start`                      | 启动本机生产服务器。                   |
| `pnpm test`                       | 运行 Vitest 测试。                     |
| `pnpm lint`                       | 运行 ESLint。                          |
| `pnpm typecheck`                  | 运行 TypeScript 类型检查。             |
| `pnpm prisma generate`            | 生成 Prisma Client。                   |
| `pnpm prisma migrate dev`         | 创建并应用开发迁移。                   |
| `pnpm prisma studio`              | 打开 Prisma Studio。                   |
| `pnpm articles:import`            | 从本地 MDX 文件导入文章。              |
| `docker compose run --rm migrate` | 在 Docker 环境中重新执行已提交的迁移。 |

## 项目结构

```text
src/
├── pages/        Astro SSR 页面、API 和元数据路由
├── layouts/      HTML 布局、SEO 与静态资源
├── views/        React 页面视图及交互岛
├── server/       服务端加载器、业务操作和 HTTP 处理
├── actions/      Astro Actions 表单入口
├── components/   博客、后台和通用 UI 组件
├── config/       站点级常量
├── hooks/        React Hooks
├── lib/          认证、内容、数据库、媒体和 SEO 逻辑
├── styles/       样式辅助模块
└── types/        TypeScript 类型
prisma/           数据模型和版本化迁移
scripts/          内容导入与维护脚本
docker/           容器入口和数据库地址转换工具
public/           静态资源
content/          本地文章导入源文件（默认不纳入 Git）
```

## 数据与升级

- PostgreSQL 是文章、用户、评论、互动、站点配置和媒体元数据的唯一持久数据源。
- 对象存储保存上传的媒体文件；数据库只保存文件信息和公开 URL。
- 更新生产环境前请同时备份 PostgreSQL 和对象存储。
- `docker compose up --build -d` 会先运行 `prisma migrate deploy`，迁移失败时 Web 服务不会启动。
- 如果更换数据库容器名称、网络或数据库名，请同步调整 `compose.yaml` 中的网络与覆盖变量。

## Astro 运行架构

Node adapter 以 SSR 模式运行，入口为 `dist/server/entry.mjs`。文章正文在服务器编译 MDX，表格、公式和代码高亮直接输出 HTML；目录、阅读进度和评论使用独立 React 岛。编辑器、媒体库及账户页面保留完整 React 交互，各自提供 Query/Message 上下文。

公开页面使用 Astro ClientRouter；后台使用完整页面导航。文章、用户、修订记录与 API URL 保持不变。登录使用 Auth.js Core 和新的会话 Cookie，升级后需要重新登录一次。数据库读缓存仅在单次请求内有效，页面 HTML 不缓存；可信作者的 MDX 编译结果采用有容量限制的内存缓存。

反向代理需传递真实 Host 和 HTTPS 协议。`astro.config.mjs` 的 `security.allowedDomains` 应包含部署域名，以允许可信代理的转发头。写请求要求匹配的 `Origin`，图片上传上限仍为 50 MB。健康检查为 `/api/health`。

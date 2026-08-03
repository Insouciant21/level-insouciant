"use client"

import { useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react"

import { updateSiteSettingsAction } from "@/app/admin/settings-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ContactKind, SiteConfig, SiteConfigData, SiteLink } from "@/lib/site"

const linkKinds: Array<{ value: ContactKind; label: string }> = [
  { value: "github", label: "GitHub" },
  { value: "email", label: "Email" },
  { value: "steam", label: "Steam" },
  { value: "website", label: "网站" },
  { value: "custom", label: "自定义" },
]

type EditableTextField = "name" | "description" | "author" | "email" | "url"

function getEditableSettings(siteConfig: SiteConfig): SiteConfigData {
  return {
    name: siteConfig.name,
    description: siteConfig.description,
    author: siteConfig.author,
    email: siteConfig.email,
    url: siteConfig.url,
    hero: {
      ...siteConfig.hero,
      primaryAction: { ...siteConfig.hero.primaryAction },
      secondaryAction: { ...siteConfig.hero.secondaryAction },
    },
    about: {
      ...siteConfig.about,
      archiveAccess: { ...siteConfig.about.archiveAccess },
      transmission: { ...siteConfig.about.transmission },
    },
    profile: { ...siteConfig.profile },
    contacts: siteConfig.contacts.map((link) => ({ ...link })),
    footer: {
      ...siteConfig.footer,
      links: siteConfig.footer.links.map((link) => ({ ...link })),
    },
    seo: { ...siteConfig.seo, keywords: [...siteConfig.seo.keywords] },
  }
}

function newLink(): SiteLink {
  return {
    id: `custom-${crypto.randomUUID()}`,
    kind: "custom",
    label: "",
    value: "",
    href: "",
    enabled: true,
  }
}

type LinkEditorProps = {
  title: string
  links: SiteLink[]
  onAdd: () => void
  onUpdate: (index: number, field: keyof SiteLink, value: string | ContactKind) => void
  onRemove: (index: number) => void
  onMove: (index: number, direction: -1 | 1) => void
  onToggle: (index: number) => void
}

function LinkEditor({
  title,
  links,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
  onToggle,
}: LinkEditorProps) {
  return (
    <section className="grid gap-4 border-t border-white/10 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#edf3e9]">{title}</h2>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus aria-hidden="true" />
          添加{title}
        </Button>
      </div>

      <div className="grid gap-4">
        {links.map((link, index) => (
          <div
            key={link.id}
            className="grid gap-4 border border-white/10 bg-[#171b16] p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`${title}-${index}-kind`}>类型</Label>
                <select
                  id={`${title}-${index}-kind`}
                  value={link.kind}
                  onChange={(event) =>
                    onUpdate(index, "kind", event.target.value as ContactKind)
                  }
                  className="admin-input h-10 w-full rounded-md border border-border bg-[var(--field-background)] px-3 text-sm text-foreground outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  {linkKinds.map((kind) => (
                    <option key={kind.value} value={kind.value}>
                      {kind.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`${title}-${index}-label`}>标签</Label>
                <Input
                  id={`${title}-${index}-label`}
                  value={link.label}
                  onChange={(event) => onUpdate(index, "label", event.target.value)}
                  className="admin-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`${title}-${index}-value`}>显示内容</Label>
                <Input
                  id={`${title}-${index}-value`}
                  value={link.value}
                  onChange={(event) => onUpdate(index, "value", event.target.value)}
                  className="admin-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`${title}-${index}-href`}>链接地址</Label>
                <Input
                  id={`${title}-${index}-href`}
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  spellCheck={false}
                  value={link.href}
                  onChange={(event) => onUpdate(index, "href", event.target.value)}
                  className="admin-input"
                  placeholder="/about 或 https://..."
                />
              </div>
            </div>

            <div className="flex items-start justify-end gap-2 lg:flex-col">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={link.enabled ? "禁用" : "启用"}
                title={link.enabled ? "禁用" : "启用"}
                onClick={() => onToggle(index)}
              >
                {link.enabled ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="上移"
                title="上移"
                disabled={index === 0}
                onClick={() => onMove(index, -1)}
              >
                <ArrowUp aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="下移"
                title="下移"
                disabled={index === links.length - 1}
                onClick={() => onMove(index, 1)}
              >
                <ArrowDown aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="删除"
                title="删除"
                onClick={() => onRemove(index)}
              >
                <Trash2 aria-hidden="true" />
              </Button>
              <a
                href={link.href || "#"}
                target="_blank"
                rel="noreferrer"
                aria-label="打开链接"
                title="打开链接"
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              >
                <ExternalLink aria-hidden="true" className="size-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  multiline = false,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  )
}

export function SiteSettingsForm({ siteConfig }: { siteConfig: SiteConfig }) {
  const [settings, setSettings] = useState(() => getEditableSettings(siteConfig))

  function updateTopLevel(field: EditableTextField, value: string) {
    setSettings((current) => ({ ...current, [field]: value }))
  }

  function updateHero(field: "eyebrow" | "title" | "description", value: string) {
    setSettings((current) => ({ ...current, hero: { ...current.hero, [field]: value } }))
  }

  function updateHeroAction(
    action: "primaryAction" | "secondaryAction",
    field: "label" | "href",
    value: string
  ) {
    setSettings((current) => ({
      ...current,
      hero: { ...current.hero, [action]: { ...current.hero[action], [field]: value } },
    }))
  }

  function updateAbout(field: Exclude<keyof SiteConfigData["about"], "archiveAccess" | "transmission">, value: string) {
    setSettings((current) => ({ ...current, about: { ...current.about, [field]: value } }))
  }

  function updateAboutAction(
    action: "archiveAccess" | "transmission",
    field: "label" | "href",
    value: string
  ) {
    setSettings((current) => ({
      ...current,
      about: { ...current.about, [action]: { ...current.about[action], [field]: value } },
    }))
  }

  function updateProfile(field: keyof SiteConfigData["profile"], value: string) {
    setSettings((current) => ({ ...current, profile: { ...current.profile, [field]: value } }))
  }

  function updateLink(
    collection: "contacts" | "footer",
    index: number,
    field: keyof SiteLink,
    value: string | ContactKind
  ) {
    setSettings((current) => {
      const links = collection === "contacts" ? current.contacts : current.footer.links
      const nextLinks = links.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link
      )

      return collection === "contacts"
        ? { ...current, contacts: nextLinks }
        : { ...current, footer: { ...current.footer, links: nextLinks } }
    })
  }

  function addLink(collection: "contacts" | "footer") {
    setSettings((current) =>
      collection === "contacts"
        ? { ...current, contacts: [...current.contacts, newLink()] }
        : { ...current, footer: { ...current.footer, links: [...current.footer.links, newLink()] } }
    )
  }

  function removeLink(collection: "contacts" | "footer", index: number) {
    setSettings((current) => {
      const links = collection === "contacts" ? current.contacts : current.footer.links
      const nextLinks = links.filter((_, linkIndex) => linkIndex !== index)

      return collection === "contacts"
        ? { ...current, contacts: nextLinks }
        : { ...current, footer: { ...current.footer, links: nextLinks } }
    })
  }

  function moveLink(collection: "contacts" | "footer", index: number, direction: -1 | 1) {
    setSettings((current) => {
      const links = collection === "contacts" ? current.contacts : current.footer.links
      const targetIndex = index + direction

      if (targetIndex < 0 || targetIndex >= links.length) {
        return current
      }

      const nextLinks = [...links]
      const [movedLink] = nextLinks.splice(index, 1)
      nextLinks.splice(targetIndex, 0, movedLink)

      return collection === "contacts"
        ? { ...current, contacts: nextLinks }
        : { ...current, footer: { ...current.footer, links: nextLinks } }
    })
  }

  function toggleLink(collection: "contacts" | "footer", index: number) {
    setSettings((current) => {
      const links = collection === "contacts" ? current.contacts : current.footer.links
      const nextLinks = links.map((link, linkIndex) =>
        linkIndex === index ? { ...link, enabled: !link.enabled } : link
      )

      return collection === "contacts"
        ? { ...current, contacts: nextLinks }
        : { ...current, footer: { ...current.footer, links: nextLinks } }
    })
  }

  return (
    <form action={updateSiteSettingsAction} className="admin-surface grid gap-7 p-4 sm:p-6 lg:p-7">
      <input type="hidden" name="settings" value={JSON.stringify(settings)} readOnly />

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold text-[#edf3e9]">站点与 SEO</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <Field id="site-name" label="站点名称" value={settings.name} onChange={(value) => updateTopLevel("name", value)} />
          <Field id="site-author" label="作者名称" value={settings.author} onChange={(value) => updateTopLevel("author", value)} />
          <Field id="site-email" label="联系邮箱" value={settings.email} onChange={(value) => updateTopLevel("email", value)} />
          <Field id="site-url" label="站点地址" value={settings.url} onChange={(value) => updateTopLevel("url", value)} />
          <Field id="site-description" label="站点描述" value={settings.description} onChange={(value) => updateTopLevel("description", value)} multiline />
          <Field id="site-og-alt" label="默认 OG 图片替代文本" value={settings.seo.defaultOgImageAlt} onChange={(value) => setSettings((current) => ({ ...current, seo: { ...current.seo, defaultOgImageAlt: value } }))} />
          <Field id="site-keywords" label="SEO 关键词（逗号分隔）" value={settings.seo.keywords.join(", ")} onChange={(value) => setSettings((current) => ({ ...current, seo: { ...current.seo, keywords: value.split(",").map((keyword) => keyword.trim()).filter(Boolean) } }))} multiline />
        </div>
      </section>

      <section className="grid gap-4 border-t border-white/10 pt-5">
        <h2 className="text-lg font-semibold text-[#edf3e9]">首页 Hero</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <Field id="hero-eyebrow" label="眉题" value={settings.hero.eyebrow} onChange={(value) => updateHero("eyebrow", value)} />
          <Field id="hero-title" label="标题" value={settings.hero.title} onChange={(value) => updateHero("title", value)} />
          <Field id="hero-description" label="描述" value={settings.hero.description} onChange={(value) => updateHero("description", value)} multiline />
          <div className="grid gap-5">
            <Field id="hero-primary-label" label="主按钮文字" value={settings.hero.primaryAction.label} onChange={(value) => updateHeroAction("primaryAction", "label", value)} />
            <Field id="hero-primary-href" label="主按钮地址" value={settings.hero.primaryAction.href} onChange={(value) => updateHeroAction("primaryAction", "href", value)} />
          </div>
          <div className="grid gap-5">
            <Field id="hero-secondary-label" label="次按钮文字" value={settings.hero.secondaryAction.label} onChange={(value) => updateHeroAction("secondaryAction", "label", value)} />
            <Field id="hero-secondary-href" label="次按钮地址" value={settings.hero.secondaryAction.href} onChange={(value) => updateHeroAction("secondaryAction", "href", value)} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 border-t border-white/10 pt-5">
        <h2 className="text-lg font-semibold text-[#edf3e9]">个人资料</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <Field id="profile-title" label="资料标题" value={settings.profile.title} onChange={(value) => updateProfile("title", value)} />
          <Field id="profile-status" label="状态" value={settings.profile.status} onChange={(value) => updateProfile("status", value)} />
          <Field id="profile-location" label="位置" value={settings.profile.location} onChange={(value) => updateProfile("location", value)} />
          <Field id="profile-summary" label="摘要" value={settings.profile.summary} onChange={(value) => updateProfile("summary", value)} multiline />
        </div>
      </section>

      <section className="grid gap-4 border-t border-white/10 pt-5">
        <h2 className="text-lg font-semibold text-[#edf3e9]">About</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <Field id="about-metadata-title" label="须知页面元标题" value={settings.about.metadataTitle} onChange={(value) => updateAbout("metadataTitle", value)} />
          <Field id="about-display-title" label="须知页标题" value={settings.about.displayTitle} onChange={(value) => updateAbout("displayTitle", value)} />
          <Field id="about-metadata-description" label="须知页描述" value={settings.about.metadataDescription} onChange={(value) => updateAbout("metadataDescription", value)} multiline />
          <Field id="about-archive-node" label="档案节点标签" value={settings.about.archiveNodeLabel} onChange={(value) => updateAbout("archiveNodeLabel", value)} />
          <Field id="about-status-label" label="状态标签" value={settings.about.statusLabel} onChange={(value) => updateAbout("statusLabel", value)} />
          <Field id="about-status-value" label="状态值" value={settings.about.statusValue} onChange={(value) => updateAbout("statusValue", value)} />
          <Field id="about-contact-heading" label="联系标题" value={settings.about.contactHeading} onChange={(value) => updateAbout("contactHeading", value)} />
          <Field id="about-quote" label="引言" value={settings.about.quote} onChange={(value) => updateAbout("quote", value)} multiline />
          <Field id="about-intro" label="介绍" value={settings.about.intro} onChange={(value) => updateAbout("intro", value)} multiline />
          <Field id="about-principles" label="原则" value={settings.about.principles} onChange={(value) => updateAbout("principles", value)} multiline />
          <div className="grid gap-5">
            <Field id="about-archive-label" label="档案入口文字" value={settings.about.archiveAccess.label} onChange={(value) => updateAboutAction("archiveAccess", "label", value)} />
            <Field id="about-archive-href" label="档案入口地址" value={settings.about.archiveAccess.href} onChange={(value) => updateAboutAction("archiveAccess", "href", value)} />
          </div>
          <div className="grid gap-5">
            <Field id="about-transmission-label" label="传输入口文字" value={settings.about.transmission.label} onChange={(value) => updateAboutAction("transmission", "label", value)} />
            <Field id="about-transmission-href" label="传输入口地址" value={settings.about.transmission.href} onChange={(value) => updateAboutAction("transmission", "href", value)} />
          </div>
        </div>
      </section>

      <LinkEditor
        title="联系方式"
        links={settings.contacts}
        onAdd={() => addLink("contacts")}
        onUpdate={(index, field, value) => updateLink("contacts", index, field, value)}
        onRemove={(index) => removeLink("contacts", index)}
        onMove={(index, direction) => moveLink("contacts", index, direction)}
        onToggle={(index) => toggleLink("contacts", index)}
      />

      <section className="grid gap-4 border-t border-white/10 pt-5">
        <Field id="footer-closing" label="页脚结束语" value={settings.footer.closing} onChange={(value) => setSettings((current) => ({ ...current, footer: { ...current.footer, closing: value } }))} multiline />
      </section>

      <LinkEditor
        title="页脚链接"
        links={settings.footer.links}
        onAdd={() => addLink("footer")}
        onUpdate={(index, field, value) => updateLink("footer", index, field, value)}
        onRemove={(index) => removeLink("footer", index)}
        onMove={(index, direction) => moveLink("footer", index, direction)}
        onToggle={(index) => toggleLink("footer", index)}
      />

      <div className="flex justify-end border-t border-white/10 pt-5">
        <Button type="submit">保存站点设置</Button>
      </div>
    </form>
  )
}

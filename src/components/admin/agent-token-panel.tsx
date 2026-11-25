import { useEffect, useState } from "react"
import { Copy, KeyRound, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AgentToken = {
  id: string
  name: string
  access: "READ" | "DRAFT" | "PUBLISH"
  expiresAt: string
  revokedAt: string | null
}

const accessLabels = { READ: "只读", DRAFT: "读写草稿", PUBLISH: "可发布" }

export function AgentTokenPanel() {
  const [tokens, setTokens] = useState<AgentToken[]>([])
  const [name, setName] = useState("写作 Agent")
  const [access, setAccess] = useState<AgentToken["access"]>("DRAFT")
  const [secret, setSecret] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const response = await fetch("/api/admin/agent-tokens")
    if (response.ok) setTokens((await response.json()) as AgentToken[])
  }

  useEffect(() => {
    void load().catch(() => undefined)
  }, [])

  async function create() {
    setBusy(true)
    setError(null)
    const response = await fetch("/api/admin/agent-tokens", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, access, days: 90 }),
    })
    const data = await response.json().catch(() => ({}))
    if (response.ok) {
      setSecret(data.token as string)
      await load()
    } else setError("令牌创建失败")
    setBusy(false)
  }

  async function revoke(id: string) {
    await fetch("/api/admin/agent-tokens", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    })
    await load()
  }

  return (
    <div className="grid gap-5">
      <div>
        <p className="admin-kicker-accent">Personal Agent</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#edf3e9]">
          Agent 访问令牌
        </h2>
        <p className="admin-copy mt-2">
          令牌只在创建完成时显示一次，撤销后无法恢复。
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end">
        <div className="grid gap-2">
          <Label htmlFor="agent-token-name" className="text-[#dce6d8]">
            名称
          </Label>
          <Input
            id="agent-token-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="admin-input h-11"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="agent-token-access" className="text-[#dce6d8]">
            权限
          </Label>
          <select
            id="agent-token-access"
            value={access}
            onChange={(event) =>
              setAccess(event.target.value as AgentToken["access"])
            }
            className="admin-input h-11 px-3 text-sm"
          >
            {Object.entries(accessLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          onClick={() => void create()}
          disabled={busy || !name.trim()}
        >
          <Plus />
          创建令牌
        </Button>
      </div>
      {secret ? (
        <div className="grid gap-3 rounded-[var(--radius)] border border-[var(--safety-exit-green)]/35 bg-[var(--safety-exit-green)]/8 p-4">
          <p className="text-sm text-[#edf3e9]">
            请在 MCP 客户端为本站的 /mcp 地址设置 Bearer
            令牌。此密钥只显示一次。
          </p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={secret}
              className="admin-input h-11 font-mono text-xs"
            />
            <Button
              type="button"
              variant="outline"
              aria-label="复制令牌"
              onClick={() => void navigator.clipboard.writeText(secret)}
            >
              <Copy />
            </Button>
          </div>
        </div>
      ) : null}
      {error ? <p className="text-sm text-[#f08b81]">{error}</p> : null}
      <div className="grid gap-2">
        {tokens.map((token) => (
          <div
            key={token.id}
            className="flex flex-wrap items-center justify-between gap-3 border border-white/10 px-3 py-3"
          >
            <div className="flex items-center gap-3">
              <KeyRound className="size-4 text-[var(--safety-exit-green)]" />
              <span className="text-sm text-[#edf3e9]">{token.name}</span>
              <span className="admin-status-pill">
                {accessLabels[token.access]}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/55">
              <span>
                {token.revokedAt
                  ? "已撤销"
                  : `至 ${new Date(token.expiresAt).toLocaleDateString("zh-CN")}`}
              </span>
              {!token.revokedAt ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`撤销 ${token.name}`}
                  onClick={() => void revoke(token.id)}
                >
                  <Trash2 />
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

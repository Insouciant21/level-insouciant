import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { agentTools } from "@/lib/agent-contract"
import { authenticateAgent } from "@/lib/agent-tokens"
import { runArticleTool } from "./agent-articles"

export async function handleArticleMcp(request: Request) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } })
  }
  const agent = await authenticateAgent(request)
  if (!agent) {
    return Response.json(
      { error: "INVALID_TOKEN" },
      {
        status: 401,
        headers: { "WWW-Authenticate": 'Bearer realm="blog-articles"' },
      }
    )
  }
  const server = new McpServer({ name: "level-insouciant", version: "0.1.0" })
  for (const [name, { description, schema }] of Object.entries(agentTools)) {
    server.registerTool(
      name,
      { description, inputSchema: schema },
      async (args: unknown) => ({
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(await runArticleTool(agent, name, args)),
          },
        ],
      })
    )
  }
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  try {
    await server.connect(transport)
    return await transport.handleRequest(request)
  } finally {
    await server.close()
  }
}

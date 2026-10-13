import { getAdminComments } from "@/lib/admin"

export async function load() {
  const comments = await getAdminComments()

  return { comments }
}

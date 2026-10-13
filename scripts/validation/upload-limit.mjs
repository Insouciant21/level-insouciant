import assert from "node:assert/strict"
if (
  process.env.STAGING_WRITE_TESTS !== "1" ||
  !process.env.DATABASE_NAME_OVERRIDE?.endsWith("-staging")
)
  throw new Error("Requires isolated staging database and storage")
const base = "http://127.0.0.1:3000"
const login = await fetch(base + "/admin/login?_action=adminLoginAction", {
  method: "POST",
  redirect: "manual",
  headers: { origin: base },
  body: new URLSearchParams({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  }),
})
assert.equal(login.status, 303)
assert.equal(login.headers.get("location"), "/admin/dashboard")
const cookie = login.headers
  .getSetCookie()
  .map((value) => value.split(";")[0])
  .join("; ")
for (const size of [50 * 1024 * 1024 + 1, 50 * 1024 * 1024]) {
  const form = new FormData()
  form.set(
    "file",
    new Blob([new Uint8Array(size)], { type: "image/png" }),
    "limit.png"
  )
  const response = await fetch(base + "/api/admin/media", {
    method: "POST",
    headers: { origin: base, cookie },
    body: form,
  })
  const data = await response.json()
  if (size > 50 * 1024 * 1024) {
    assert.equal(response.status, 400)
    assert.equal(data.error, "MEDIA_FILE_TOO_LARGE")
  } else {
    assert.equal(response.status, 201)
    assert.equal(
      (
        await fetch(base + "/api/admin/media/" + data.id, {
          method: "DELETE",
          headers: { origin: base, cookie },
        })
      ).status,
      200
    )
  }
  console.log("Upload boundary", size, response.status)
}

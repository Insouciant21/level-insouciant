import Image from "next/image"
import { Upload } from "lucide-react"

import { uploadFaviconAction } from "@/app/admin/favicon-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FaviconUploadFormProps = {
  currentIconUrl: string
}

function FaviconUploadForm({ currentIconUrl }: FaviconUploadFormProps) {
  return (
    <section className="admin-surface grid gap-5 p-4 sm:p-6 lg:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="admin-kicker-accent">Favicon</p>
          <h2 className="admin-title mt-2 text-2xl">站点图标</h2>
        </div>
        <div className="flex size-14 items-center justify-center rounded-md border border-[var(--safety-exit-green)]/25 bg-[var(--admin-background)] p-2">
          <Image
            src={currentIconUrl}
            alt="当前站点图标"
            width={40}
            height={40}
            className="size-10 object-contain"
          />
        </div>
      </div>

      <form
        action={uploadFaviconAction}
        className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
      >
        <div className="grid gap-2">
          <Label htmlFor="favicon-file">站点图标</Label>
          <Input
            id="favicon-file"
            name="favicon"
            type="file"
            accept=".png,.ico,image/png,image/x-icon,image/vnd.microsoft.icon"
            required
            className="admin-input file:mr-3 file:border-0 file:bg-transparent file:font-medium file:text-[var(--admin-accent)]"
          />
        </div>
        <Button type="submit" className="justify-center">
          <Upload className="size-4" aria-hidden="true" />
          上传并生成图标
        </Button>
      </form>
    </section>
  )
}

export { FaviconUploadForm }

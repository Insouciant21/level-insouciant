declare module "ali-oss" {
  type PutOptions = {
    headers: {
      "Content-Type": string
    }
  }

  type OssOptions = {
    region: string
    bucket: string
    endpoint?: string
    accessKeyId: string
    accessKeySecret: string
  }

  class OSS {
    constructor(options: OssOptions)

    put(objectKey: string, body: Buffer, options: PutOptions): Promise<unknown>

    delete(objectKey: string): Promise<unknown>
  }

  export default OSS
}

declare module "ico-endec" {
  export type IcoEntry = {
    width: number
    height: number
    imageType: "png" | "bmp"
    imageData: Buffer
  }

  export function decode(input: Buffer): IcoEntry[]
  export function encode(input: Buffer | Buffer[]): Buffer
}

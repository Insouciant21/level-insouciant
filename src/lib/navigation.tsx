import { createContext, useContext } from "react"
import type { ComponentProps } from "react"
export const LocationContext = createContext("/")
export function usePathname() {
  return new URL(useContext(LocationContext), "http://localhost").pathname
}
export function useSearchParams() {
  return new URL(useContext(LocationContext), "http://localhost").searchParams
}
export default function Link({ href, ...props }: ComponentProps<"a">) {
  return <a href={href} {...props} />
}

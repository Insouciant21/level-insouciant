import { createContext, useContext } from 'react'
import type { ComponentProps } from 'react'
export const LocationContext = createContext('/')
export function usePathname() { return new URL(useContext(LocationContext), 'http://localhost').pathname }
export function useSearchParams() { return new URL(useContext(LocationContext), 'http://localhost').searchParams }
export default function Link({ href, ...props }: ComponentProps<'a'> & { prefetch?: boolean }) {
  const { prefetch: _prefetch, ...rest } = props
  void _prefetch
  return <a href={href} {...rest} />
}

export function usePathname() {
  return '/coffee/my'
}

export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
    prefetch: async () => {},
  }
}

export function redirect(path: string) {
  throw new Error(`redirect called to ${path} in Storybook`) 
}

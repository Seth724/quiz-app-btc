const getEnvVar = (key: string): string => {
  // Use process.env for Next.js instead of import.meta.env (Vite) - Fixed for Next.js
  const value = process.env[key]
  if (value) return value
  return ''
}

export const VITE_WITHDRAW_MOD_SPEC: string = getEnvVar('NEXT_PUBLIC_WITHDRAW_MOD_SPEC')

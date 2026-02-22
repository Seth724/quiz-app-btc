import type { Computer } from '@bitcoin-computer/lib'

/**
 * Loads exported classes from deployed module specs in a browser-safe way.
 * Caches loads so we don't reload the same module repeatedly.
 */
const moduleCache = new Map<string, any>()

export async function loadDeployedModule(computer: Computer, modSpec: string) {
  if (!modSpec) throw new Error('Missing module spec')
  if (moduleCache.has(modSpec)) return moduleCache.get(modSpec)

  const mod = await computer.load(modSpec)
  moduleCache.set(modSpec, mod)
  return mod
}

export async function loadExportedClass<T = any>(
  computer: Computer,
  modSpec: string,
  exportName: string
): Promise<T> {
  const mod = await loadDeployedModule(computer, modSpec)
  const cls = mod?.[exportName]
  if (!cls) {
    throw new Error(
      `Module ${modSpec} does not export '${exportName}'. Available: ${Object.keys(mod || {}).join(', ')}`
    )
  }
  return cls as T
}

import type { Computer } from '@bitcoin-computer/lib'

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * One global queue per Computer instance so *all* clients sharing the same computer
 * cannot broadcast conflicting txs concurrently.
 */
const computerLocks = new WeakMap<Computer, Promise<void>>()

export async function withComputerLock<T>(computer: Computer, fn: () => Promise<T>): Promise<T> {
  const prev = computerLocks.get(computer) ?? Promise.resolve()

  let release!: () => void
  const next = new Promise<void>((r) => (release = r))

  computerLocks.set(computer, prev.then(() => next))

  await prev
  try {
    return await fn()
  } finally {
    release()
  }
}

function msgOf(err: unknown) {
  if (err instanceof Error) return err.message
  return String(err)
}

export function isRetryableBcNetworkError(err: unknown) {
  const msg = msgOf(err)
  const code = String((err as Record<string, unknown>)?.code ?? '')

  // Axios/browser/network-ish
  if (code === 'ERR_NETWORK') return true
  if (msg.includes('Network Error')) return true
  if (msg.includes('ERR_EMPTY_RESPONSE')) return true
  if (msg.includes('ECONNRESET')) return true
  if (msg.toLowerCase().includes('timeout')) return true

  return false
}

export function isRetryableMempoolError(err: unknown) {
  const msg = msgOf(err)
  return (
    msg.includes('txn-mempool-conflict') ||
    msg.includes('too-long-mempool-chain') ||
    msg.includes('insufficient fee') // sometimes transient with dynamic fee estimation
  )
}

/**
 * Wait until the BCN indexer can `sync(id)` (helps after broadcast before next encode/fund).
 * Works for unconfirmed objects too (mempool).
 */
export async function waitForSync(
  computer: Computer,
  id: string,
  opts: { timeoutMs?: number; intervalMs?: number } = {}
) {
  const timeoutMs = opts.timeoutMs ?? 15_000
  const intervalMs = opts.intervalMs ?? 300

  const start = Date.now()
  while (true) {
    try {
      await computer.sync(id)
      return
    } catch (e) {
      if (Date.now() - start > timeoutMs) throw e
      await sleep(intervalMs)
    }
  }
}

type EncodeArgs = {
  exp: string
  mod: string
  env?: Record<string, string>
}

type EncodeBroadcastOpts = {
  label?: string
  maxAttempts?: number
  baseDelayMs?: number
  postBroadcastDelayMs?: number
  waitForEffectSync?: boolean
}

/**
 * Re-encodes and re-broadcasts on transient errors.
 * IMPORTANT: on mempool-conflict you *must* re-encode to get different inputs.
 */
export async function encodeBroadcastWithRetry(
  computer: Computer,
  args: EncodeArgs,
  opts: EncodeBroadcastOpts = {}
): Promise<unknown> {
  const label = opts.label ?? 'tx'
  const maxAttempts = opts.maxAttempts ?? 6
  const baseDelayMs = opts.baseDelayMs ?? 450
  const postBroadcastDelayMs = opts.postBroadcastDelayMs ?? 800
  const waitForEffectSync = opts.waitForEffectSync ?? true

  let lastErr: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const encoded = await computer.encode(args)

      await computer.broadcast(encoded.tx)

      // give BCN a moment to update UTXO view / mempool index
      if (waitForEffectSync) {
        const effect = encoded?.effect as Record<string, unknown> | undefined
        const res = effect?.res as Record<string, unknown> | undefined
        const id = res?._id
        if (typeof id === 'string' && id.length > 10) {
          try {
            await waitForSync(computer, id, { timeoutMs: 12_000, intervalMs: 250 })
          } catch {
            // not fatal; we still delay below
          }
        }
      }

      await sleep(postBroadcastDelayMs)
      return encoded
    } catch (err: unknown) {
      lastErr = err

      const retryable =
        isRetryableBcNetworkError(err) ||
        isRetryableMempoolError(err)

      if (!retryable || attempt === maxAttempts) break

      // backoff
      const extra = isRetryableMempoolError(err) ? 600 : 0
      const delay = baseDelayMs * attempt + extra
      console.warn(`⚠️ ${label} failed (attempt ${attempt}/${maxAttempts}): ${msgOf(err)}. Retrying in ${delay}ms`)
      await sleep(delay)
    }
  }

  throw lastErr
}
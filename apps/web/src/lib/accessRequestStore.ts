/**
 * Shared Access Request Store
 * In-memory storage for access requests with singleton pattern.
 * Both API route handlers import this module to share the same Map.
 * Uses globalThis to survive Next.js HMR (hot module replacement) in dev mode.
 * In production, replace with a database.
 */

export interface AccessRequestData {
  id: string
  quizId: string
  quizTitle: string
  studentPublicKey: string
  teacherPublicKey: string
  entryFee: string // bigint serialized as string
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  offerTxHex?: string // serialized offer tx from teacher
  accessTokenId?: string
  completedTxId?: string
  createdAt: number
  updatedAt: number
}

// Use globalThis to persist across HMR in dev mode
const globalStore = globalThis as typeof globalThis & {
  __accessRequestStore?: Map<string, AccessRequestData>
  __accessRequestNextId?: number
}

if (!globalStore.__accessRequestStore) {
  globalStore.__accessRequestStore = new Map<string, AccessRequestData>()
}
if (!globalStore.__accessRequestNextId) {
  globalStore.__accessRequestNextId = 1
}

const store = globalStore.__accessRequestStore
function getNextId() {
  const id = globalStore.__accessRequestNextId!
  globalStore.__accessRequestNextId = id + 1
  return id
}

export function getAllRequests(): AccessRequestData[] {
  return Array.from(store.values()).sort((a, b) => b.createdAt - a.createdAt)
}

export function getRequestById(id: string): AccessRequestData | undefined {
  return store.get(id)
}

export function getRequestsByFilter(filters: {
  quizId?: string
  studentPublicKey?: string
  teacherPublicKey?: string
  status?: string
}): AccessRequestData[] {
  let results = getAllRequests()
  if (filters.quizId) results = results.filter(r => r.quizId === filters.quizId)
  if (filters.studentPublicKey) results = results.filter(r => r.studentPublicKey === filters.studentPublicKey)
  if (filters.teacherPublicKey) results = results.filter(r => r.teacherPublicKey === filters.teacherPublicKey)
  if (filters.status) results = results.filter(r => r.status === filters.status)
  return results
}

export function createRequest(data: {
  quizId: string
  quizTitle: string
  studentPublicKey: string
  teacherPublicKey: string
  entryFee: string
}): AccessRequestData {
  // Check for duplicate pending request
  const existing = getRequestsByFilter({
    quizId: data.quizId,
    studentPublicKey: data.studentPublicKey,
    status: 'pending',
  })
  if (existing.length > 0) return existing[0]

  const id = `ar-${getNextId()}-${Date.now()}`
  const now = Date.now()
  const request: AccessRequestData = {
    id,
    ...data,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  store.set(id, request)
  return request
}

export function updateRequest(
  id: string,
  updates: Partial<Pick<AccessRequestData, 'status' | 'offerTxHex' | 'accessTokenId' | 'completedTxId'>>
): AccessRequestData | null {
  const existing = store.get(id)
  if (!existing) return null

  const updated: AccessRequestData = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  }
  store.set(id, updated)
  return updated
}

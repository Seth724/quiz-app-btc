/**
 * Access Request - Single item API route
 * GET /api/access-requests/[id] - Get single request
 * PATCH /api/access-requests/[id] - Update request (approve, complete, reject)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRequestById, updateRequest } from '@/lib/accessRequestStore'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const item = getRequestById(id)

  if (!item) {
    return NextResponse.json({ error: 'Access request not found' }, { status: 404 })
  }

  return NextResponse.json(item)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, offerTxHex, accessTokenId, completedTxId } = body

    console.log('📬 [API] PATCH /api/access-requests/' + id, '— updates:', {
      status,
      hasOfferTxHex: !!offerTxHex,
      accessTokenId: accessTokenId?.slice(0, 16),
      completedTxId: completedTxId?.slice(0, 16),
    })

    const updated = updateRequest(id, { status, offerTxHex, accessTokenId, completedTxId })

    if (!updated) {
      console.log('📬 [API] PATCH — NOT FOUND:', id)
      return NextResponse.json({ error: 'Access request not found' }, { status: 404 })
    }

    console.log('📬 [API] PATCH — updated:', updated.id, 'new status:', updated.status)

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update access request:', error)
    return NextResponse.json(
      { error: 'Failed to update access request' },
      { status: 500 }
    )
  }
}

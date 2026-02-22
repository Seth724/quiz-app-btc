/**
 * Access Request Relay API Routes
 * GET /api/access-requests - List requests (with query filters)
 * POST /api/access-requests - Create a new access request
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getRequestsByFilter,
  createRequest,
} from '@/lib/accessRequestStore'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const filters = {
    quizId: searchParams.get('quizId') ?? undefined,
    studentPublicKey: searchParams.get('studentPublicKey') ?? undefined,
    teacherPublicKey: searchParams.get('teacherPublicKey') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  }

  console.log('📬 [API] GET /api/access-requests — filters:', JSON.stringify(filters))

  const results = getRequestsByFilter(filters)

  console.log('📬 [API] GET /api/access-requests — found', results.length, 'results')

  return NextResponse.json(results)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quizId, quizTitle, studentPublicKey, teacherPublicKey, entryFee } = body

    if (!quizId || !studentPublicKey || !teacherPublicKey) {
      return NextResponse.json(
        { error: 'Missing required fields: quizId, studentPublicKey, teacherPublicKey' },
        { status: 400 }
      )
    }

    console.log('📬 [API] POST /api/access-requests — creating request:', {
      quizId,
      quizTitle,
      studentPublicKey: studentPublicKey?.slice(0, 16) + '...',
      teacherPublicKey: teacherPublicKey?.slice(0, 16) + '...',
      entryFee,
    })

    const accessRequest = createRequest({
      quizId,
      quizTitle: quizTitle || '',
      studentPublicKey,
      teacherPublicKey,
      entryFee: entryFee?.toString() || '0',
    })

    console.log('📬 [API] POST /api/access-requests — created:', accessRequest.id, 'status:', accessRequest.status)

    return NextResponse.json(accessRequest, { status: 201 })
  } catch (error) {
    console.error('Failed to create access request:', error)
    return NextResponse.json(
      { error: 'Failed to create access request' },
      { status: 500 }
    )
  }
}

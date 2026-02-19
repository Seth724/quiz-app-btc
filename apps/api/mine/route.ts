import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { blocks = 1 } = await req.json()

  // Change this to your actual mining/rpc service URL
  const RPC_URL = process.env.BCN_RPC_URL ?? 'http://localhost:9112/v1/regtest/rpc'

  const r = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ method: 'generatetoaddress', params: [blocks] }), // or whatever your service expects
  })

  const text = await r.text()
  return new NextResponse(text, { status: r.status })
}
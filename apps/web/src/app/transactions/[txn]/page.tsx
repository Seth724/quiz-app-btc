/**
 * Dynamic route for displaying blockchain transactions
 * Uses the common Transaction component
 */

'use client'

import { Transaction } from '@/common-components'
import { use } from 'react'

export default function TransactionPage({ params }: { params: Promise<{ txn: string }> }) {
  const { txn } = use(params)
  return (
    <div className="container mx-auto px-4 py-8">
      <Transaction.Component />
    </div>
  )
}
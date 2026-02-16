/**
 * Dynamic route for displaying blockchain transactions
 * Uses the common Transaction component
 */

'use client'

import { Transaction } from '@/common-components'

export default function TransactionPage({ params }: { params: { txn: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Transaction.Component />
    </div>
  )
}
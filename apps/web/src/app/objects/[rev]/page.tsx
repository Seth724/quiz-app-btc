/**
 * Dynamic route for displaying smart contract objects
 * Uses the common SmartObject component
 */

'use client'

import { SmartObject } from '@/common-components'

export default function ObjectPage({ params }: { params: { rev: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <SmartObject.Component title={`Object: ${decodeURIComponent(params.rev)}`} />
    </div>
  )
}
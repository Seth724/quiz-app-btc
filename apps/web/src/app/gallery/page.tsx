/**
 * Gallery page to display all smart contract objects
 * Uses the common Gallery component
 */

'use client'

import { Gallery } from '@/common-components'

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Smart Contract Objects Gallery</h1>
      <Gallery.WithPagination />
    </div>
  )
}
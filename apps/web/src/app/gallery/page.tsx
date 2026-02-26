"use client";

import { Gallery } from "@/common-components";
import { MODULE_SPECS } from "@/config";

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Smart Contract Objects Gallery</h1>

      <h2 className="text-xl font-semibold mt-6">Quiz Objects</h2>
      <Gallery.WithPagination source="contracts" mod={MODULE_SPECS.quizMod} />

      <h2 className="text-xl font-semibold mt-6">Payment Objects</h2>
      <Gallery.WithPagination source="contracts" mod={MODULE_SPECS.paymentMod} />

      <h2 className="text-xl font-semibold mt-6">Recent UTXOs (Objects)</h2>
      <Gallery.WithPagination source="utxos" isObject={true} isSpent={false} verbosity={0} />
    </div>
  );
}
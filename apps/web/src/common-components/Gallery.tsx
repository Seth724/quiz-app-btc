"use client";

import { Computer } from "@bitcoin-computer/lib";
import { useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { initFlowbite } from "flowbite";
import { Json, jsonMap, strip, toObject } from "./common/utils";
import { useUtilsComponents } from "./UtilsContext";
import { ComputerContext } from "./ComputerContext";

export type Class = new (...args: unknown[]) => unknown;

export type UserQuery<T extends Class> = Partial<{
  mod: string;
  publicKey: string;
  limit: number;
  offset: number;
  order: "ASC" | "DESC";
  ids: string[];
  contract: {
    class: T;
    args?: ConstructorParameters<T>;
  };

  // These are valid getOUTXOs filters in bc ecosystem (keep if your backend supports them)
  isObject: boolean;
  isSpent: boolean;
  verbosity: number;
}>;

type SourceMode = "contracts" | "utxos";

function HomePageCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="block w-72 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <pre className="font-normal overflow-auto text-gray-700 dark:text-gray-400 text-xs whitespace-pre-wrap break-words">
        {children}
      </pre>
    </div>
  );
}

function safeToPretty(value: unknown) {
  try {
    // BigInt-safe stringify
    return JSON.stringify(
      value,
      (_k, v) => (typeof v === "bigint" ? v.toString() : v),
      2
    );
  } catch {
    return String(value);
  }
}

function ValueComponent({ rev, computer }: { rev: string; computer: Computer }) {
  const [value, setValue] = useState<unknown>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        const synced = await computer.sync(rev);

        // Try to map/strip to readable object
        const mapped = toObject(jsonMap(strip)(synced as Json));

        // If mapping results in {}, fall back to raw synced
        const isEmptyObj =
          mapped &&
          typeof mapped === "object" &&
          !Array.isArray(mapped) &&
          Object.keys(mapped).length === 0;

        if (!cancelled) {
          setValue(isEmptyObj ? synced : mapped);
          setErrorMsg("");
        }
      } catch (err: unknown) {
        if (!cancelled) setErrorMsg(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [computer, rev]);

  if (loading) return <HomePageCard>Loading…</HomePageCard>;
  if (errorMsg) return <HomePageCard>{errorMsg}</HomePageCard>;
  return <HomePageCard>{safeToPretty(value)}</HomePageCard>;
}

function FromRevs({ revs, computer }: { revs: string[]; computer: Computer | null }) {
  if (!computer) return null;

  return (
    <div className="flex flex-wrap flex-col max-h-[75vh] gap-4 mb-4 mt-4">
      {revs.map((rev) => (
        <div key={rev}>
          <Link
            href={`/objects/${encodeURIComponent(rev)}`}
            className="block font-medium text-blue-600 dark:text-blue-500"
          >
            <ValueComponent rev={rev} computer={computer} />
          </Link>
        </div>
      ))}
    </div>
  );
}

function Pagination({
  isPrevAvailable,
  handlePrev,
  isNextAvailable,
  handleNext,
}: {
  isPrevAvailable: boolean;
  handlePrev: () => void;
  isNextAvailable: boolean;
  handleNext: () => void;
}) {
  return (
    <nav className="flex items-center justify-between" aria-label="Table navigation">
      <ul className="inline-flex items-center -space-x-px">
        <li>
          <button
            disabled={!isPrevAvailable}
            onClick={handlePrev}
            className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Previous
          </button>
        </li>
        <li>
          <button
            disabled={!isNextAvailable}
            onClick={handleNext}
            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}

/**
 * Usage:
 * <Gallery.WithPagination mod={MODULE_SPECS.quizMod} source="contracts" />
 * <Gallery.WithPagination mod={MODULE_SPECS.paymentMod} source="contracts" />
 * <Gallery.WithPagination source="utxos" isObject={true} isSpent={false} verbosity={0} />
 */
export function WithPagination<T extends Class>(
  props: UserQuery<T> & { source?: SourceMode }
) {
  const contractsPerPage = 12;
  const computer = useContext(ComputerContext);
  const { showLoader } = useUtilsComponents();

  const [pageNum, setPageNum] = useState(0);
  const [isNextAvailable, setIsNextAvailable] = useState(true);
  const [isPrevAvailable, setIsPrevAvailable] = useState(false);
  const [showNoAsset, setShowNoAsset] = useState(false);
  const [revs, setRevs] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const urlParams = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  useEffect(() => {
    initFlowbite();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      showLoader(true);
      setShowNoAsset(false);

      try {
        if (!computer) return;

        const source: SourceMode = props.source ?? "contracts";

        // ---- A) contracts mode: list object ids from indexer ----
        if (source === "contracts") {
          if (!props.mod) {
            setRevs([]);
            setIsNextAvailable(false);
            setIsPrevAvailable(pageNum > 0);
            setShowNoAsset(true);
            return;
          }

          const ids = await computer.query({
            mod: props.mod,
            ...(props.publicKey ? { publicKey: props.publicKey } : {}),
          });

          // make newest first
          const ordered = [...ids].reverse();

          const start = pageNum * contractsPerPage;
          const end = start + contractsPerPage + 1;
          const page = ordered.slice(start, end);

          setIsNextAvailable(page.length > contractsPerPage);
          setIsPrevAvailable(pageNum > 0);
          setRevs(page.slice(0, contractsPerPage));

          if (pageNum === 0 && ordered.length === 0) setShowNoAsset(true);
          return;
        }

        // ---- B) utxos mode: get recent outputs (DO NOT pass `source`) ----
        // Only include params getOUTXOs understands.
        const query: Record<string, string | number | boolean> = {
          offset: contractsPerPage * pageNum,
          limit: contractsPerPage + 1,
          order: "DESC",

          // optional filters (only set if defined)
          ...(props.mod ? { mod: props.mod } : {}),
          ...(props.publicKey ? { publicKey: props.publicKey } : {}),
          ...(props.isObject !== undefined ? { isObject: props.isObject } : {}),
          ...(props.isSpent !== undefined ? { isSpent: props.isSpent } : {}),
          ...(props.verbosity !== undefined ? { verbosity: props.verbosity } : {}),
        };

        // If you want to allow URL params, only keep safe ones:
        // (prevent passing random params that break the API)
        const safeKeys = new Set(["mod", "publicKey", "isObject", "isSpent", "verbosity"]);
        for (const [k, v] of Object.entries(urlParams)) {
          if (safeKeys.has(k)) query[k] = v;
        }

        const result = await computer.getOUTXOs(query);

        setIsNextAvailable(result.length > contractsPerPage);
        setIsPrevAvailable(pageNum > 0);
        setRevs(result.slice(0, contractsPerPage));

        if (pageNum === 0 && result.length === 0) setShowNoAsset(true);
      } finally {
        showLoader(false);
      }
    };

    fetch();
  }, [
    computer,
    pageNum,
    props.source,
    props.mod,
    props.publicKey,
    props.isObject,
    props.isSpent,
    props.verbosity,
    urlParams,
    showLoader,
  ]);

  const handleNext = () => setPageNum((p) => p + 1);
  const handlePrev = () => setPageNum((p) => Math.max(0, p - 1));

  return (
    <div className="relative sm:rounded-lg pt-4 w-full">
      <FromRevs revs={revs} computer={computer} />

      {!(pageNum === 0 && revs.length === 0) && (
        <Pagination
          isPrevAvailable={isPrevAvailable}
          handlePrev={handlePrev}
          isNextAvailable={isNextAvailable}
          handleNext={handleNext}
        />
      )}

      {pageNum === 0 && revs.length === 0 && showNoAsset && (
        <h1 className="w-full mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white text-center mx-auto">
          No Objects Found
        </h1>
      )}
    </div>
  );
}

export const Gallery = {
  FromRevs,
  WithPagination,
};
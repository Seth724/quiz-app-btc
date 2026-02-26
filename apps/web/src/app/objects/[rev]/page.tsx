"use client";

import { useParams } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import { ComputerContext } from "@/common-components/ComputerContext";

function normalizeRev(input: string | string[] | undefined) {
  if (!input) return "";
  const raw = Array.isArray(input) ? input[0] : input;
  return decodeURIComponent(raw).trim();
}

function safeStringify(value: unknown) {
  return JSON.stringify(
    value,
    (_k, v) => (typeof v === "bigint" ? v.toString() : v),
    2
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow p-6">
      <div className="text-lg font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

export default function ObjectPage() {
  const params = useParams<{ rev: string }>();
  const computer = useContext(ComputerContext);
  const rev = useMemo(() => normalizeRev(params?.rev), [params]);

  const [obj, setObj] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!computer || !rev) return;

    let active = true;

    (async () => {
      try {
        const res = await computer.sync(rev);
        if (!active) return;
        setObj(res as Record<string, unknown>);
      } catch (e: unknown) {
        if (!active) return;
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [computer, rev]);

  if (!computer) return null;
  if (!rev) return <pre>Missing object id</pre>;
  if (loading) return <pre>Loading...</pre>;
  if (err) return <pre>{err}</pre>;
  if (!obj) return <pre>No data</pre>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card title="Object ID">
        <div className="font-mono text-sm break-all">{rev}</div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Key Fields">
          <div className="space-y-2 text-sm">
            <div><span className="font-semibold">_id:</span> <span className="font-mono break-all">{String(obj._id ?? '')}</span></div>
            <div><span className="font-semibold">_rev:</span> <span className="font-mono break-all">{String(obj._rev ?? '')}</span></div>
            <div><span className="font-semibold">_root:</span> <span className="font-mono break-all">{String(obj._root ?? '')}</span></div>
            <div><span className="font-semibold">_satoshis:</span> <span className="font-mono break-all">{String(obj._satoshis)}</span></div>
            <div><span className="font-semibold">_owners:</span> <span className="font-mono break-all">{safeStringify(obj._owners)}</span></div>
          </div>
        </Card>

        <Card title="Raw JSON">
          <pre className="text-xs whitespace-pre-wrap break-words font-mono">
            {safeStringify(obj)}
          </pre>
        </Card>
      </div>
    </div>
  );
}
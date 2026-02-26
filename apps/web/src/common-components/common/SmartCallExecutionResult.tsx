import Link from "next/link";
import { useRouter } from "next/navigation";

interface FunctionResultObject {
  _rev?: string;
  res?: { toString(): string };
}

interface FunctionResultProps {
  functionResult: FunctionResultObject | string | null;
}

export function FunctionResultModalContent({ functionResult }: FunctionResultProps) {
  const router = useRouter();

  if (!functionResult) {
    return (
      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 p-2">
        No result
      </p>
    );
  }

  if (typeof functionResult === "string") {
    return (
      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 p-2">
        {functionResult}
      </p>
    );
  }

  // functionResult is FunctionResultObject
  if (functionResult._rev && functionResult.res) {
    return (
      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
        You created the value below at Revision {functionResult._rev}
        <pre>{functionResult.res.toString()}</pre>
      </p>
    );
  }

  if (functionResult._rev) {
    return (
      <div
        id="smart-call-execution-success"
        className="p-4 md:p-5 dark:text-gray-400"
      >
        You created a&nbsp;
        <Link
          id="smart-call-execution-counter-link"
          href={`/objects/${functionResult._rev}`}
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          onClick={() => {
            router.push(`/objects/${functionResult._rev}`);
          }}
        >
          smart object
        </Link>
        .
      </div>
    );
  }

  return (
    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 p-2">
      {JSON.stringify(functionResult)}
    </p>
  );
}

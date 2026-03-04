import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface FunctionResult {
  _rev?: string
  res?: {
    toString: () => string
  }
}

interface FunctionResultModalContentProps {
  functionResult: FunctionResult | string | Record<string, unknown>
}

export function FunctionResultModalContent({ functionResult }: FunctionResultModalContentProps) {
  const router = useRouter()

  if (functionResult && typeof functionResult === 'object' && !Array.isArray(functionResult)) {
    const result = functionResult as FunctionResult
    return (
      <>
        <div id="smart-call-execution-success" className="p-4 md:p-5 dark:text-gray-400">
          You created an&nbsp;
          <Link
            id="smart-call-execution-counter-link"
            href={`/objects/${result._rev}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              router.push(`/objects/${result._rev}`)
              window.location.reload()
            }}
          >
            on chain object
          </Link>
          .
        </div>
      </>
    )
  }

  if (typeof functionResult === 'object' && functionResult !== null && '_rev' in functionResult) {
    const result = functionResult as FunctionResult
    if (result._rev && result.res?.toString())
      return (
        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          You created the value below at Revision {result._rev}
          <pre>{result.res.toString()}</pre>
        </p>
      )
  }

  return (
    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 p-2">
      {functionResult}
    </p>
  )
}

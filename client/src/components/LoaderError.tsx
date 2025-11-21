import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import {
  useRouter,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'

interface LoaderErrorProps {
  error: Error | { message: string } | unknown
  reset?: () => void
}

export function LoaderError(
  props: LoaderErrorProps | ErrorComponentProps,
) {
  const { error, reset } = props
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  const message =
    error && typeof error === 'object' && 'message' in error
      ? (error as { message: string | undefined }).message ?? 'Unknown error'
      : String(error ?? 'Unknown error')

  const handleRetry = () => {
    if (reset) {
      reset()
    } else {
      router.invalidate()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="flex w-full max-w-lg flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-6 text-center shadow-sm">
        <AlertCircle className="text-red-500" size={32} />
        <h2 className="text-lg font-semibold text-slate-900">
          Something went wrong
        </h2>
        <p className="text-sm text-slate-500 break-all">{message}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    </div>
  )
}

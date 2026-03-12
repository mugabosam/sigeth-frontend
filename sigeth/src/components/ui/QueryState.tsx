import { AlertCircle, RefreshCw } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";

interface Props {
  query: UseQueryResult;
  children: React.ReactNode;
}

/** Wrap any query-driven UI — shows spinner while loading, error card on failure. */
export default function QueryState({ query, children }: Props) {
  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (query.isError) {
    const message =
      query.error instanceof Error ? query.error.message : "An error occurred";

    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-500">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm">{message}</p>
        <button
          onClick={() => query.refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

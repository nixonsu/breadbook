"use client";

import type { ReactNode } from "react";
import Spinner from "./Spinner";

interface FetchContentProps<T> {
  data: T | null;
  loading: boolean;
  hasData?: (data: T) => boolean;
  emptyMessage?: string;
  children: (data: T) => ReactNode;
}

export default function FetchContent<T>({
  data,
  loading,
  hasData,
  emptyMessage = "No data available yet.",
  children,
}: FetchContentProps<T>) {
  const dataPresent = data !== null && (hasData ? hasData(data) : true);

  if (!dataPresent) {
    if (loading) return <Spinner />;
    return (
      <p className="text-center text-gray-500 py-8">{emptyMessage}</p>
    );
  }

  return (
    <div
      className={
        loading
          ? "opacity-50 pointer-events-none transition-opacity"
          : "transition-opacity"
      }
    >
      {children(data as T)}
    </div>
  );
}

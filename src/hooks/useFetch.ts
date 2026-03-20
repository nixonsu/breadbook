"use client";

import { useCallback, useEffect, useState } from "react";

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  refetch: () => void;
}

export function useFetch<T>(url: string | (() => string)): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const resolvedUrl = typeof url === "function" ? url() : url;

  const doFetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(resolvedUrl);
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [resolvedUrl]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  return { data, loading, refetch: doFetch };
}

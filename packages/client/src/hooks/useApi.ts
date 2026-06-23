import { useState, useCallback } from 'react';
import type { ApiResponse } from '@mindsea/shared';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

type ApiFunction<TArgs extends unknown[], TData> = (...args: TArgs) => Promise<ApiResponse<TData>>;

export function useApi<TArgs extends unknown[], TData>(
  apiFunc: ApiFunction<TArgs, TData>,
) {
  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: TArgs): Promise<ApiResponse<TData>> => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await apiFunc(...args);
      if (result.success && result.data) {
        setState({ data: result.data, loading: false, error: null });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error ?? '未知错误',
        }));
      }
      return result;
    },
    [apiFunc],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
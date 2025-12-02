import { useState, useEffect, useCallback, useRef } from "react";

export interface ForestMaskResult {
  originalAreaHectares: number;
  forestAreaHectares: number;
  excludedAreaHectares: number;
  reductionPercent: number;
  fragmentCount: number;
  forestPolygons: GeoJSON.Polygon[];
  metadata: {
    threshold: number;
    simplifyTolerance: number;
    processedAt: string;
    source: string;
  };
}

export interface UseForestMaskOptions {
  debounceMs?: number;
  onSuccess?: (result: ForestMaskResult) => void;
  onError?: (error: Error) => void;
}

export interface UseForestMaskReturn {
  applyMask: (geometry: GeoJSON.Polygon, threshold: number) => Promise<void>;
  result: ForestMaskResult | null;
  isLoading: boolean;
  error: Error | null;
  preview: boolean;
  setPreview: (preview: boolean) => void;
  cancelPreview: () => void;
  applyFilter: () => void;
}

export function useForestMask(
  options: UseForestMaskOptions = {}
): UseForestMaskReturn {
  const { debounceMs = 500, onSuccess, onError } = options;

  const [result, setResult] = useState<ForestMaskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [preview, setPreview] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const applyMask = useCallback(
    async (geometry: GeoJSON.Polygon, threshold: number) => {
      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Set up new debounced request
      debounceTimerRef.current = setTimeout(async () => {
        setIsLoading(true);
        setError(null);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          const response = await fetch("/api/gee/forest-mask", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              geometry,
              threshold,
            }),
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error("Error al aplicar filtro de bosque");
          }

          const data = await response.json();
          setResult(data.data);
          setPreview(true);

          if (onSuccess) {
            onSuccess(data.data);
          }
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            // Request was cancelled, ignore
            return;
          }

          const error = err instanceof Error ? err : new Error("Unknown error");
          setError(error);

          if (onError) {
            onError(error);
          }
        } finally {
          setIsLoading(false);
          abortControllerRef.current = null;
        }
      }, debounceMs);
    },
    [debounceMs, onSuccess, onError]
  );

  const cancelPreview = useCallback(() => {
    setPreview(false);
    setResult(null);
  }, []);

  const applyFilter = useCallback(() => {
    setPreview(false);
    // Keep result but exit preview mode
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    applyMask,
    result,
    isLoading,
    error,
    preview,
    setPreview,
    cancelPreview,
    applyFilter,
  };
}

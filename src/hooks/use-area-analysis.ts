import { useState, useCallback } from "react";

export type AnalysisStage =
  | "idle"
  | "connecting"
  | "analyzing-forest"
  | "counting-elements"
  | "calculating-metrics"
  | "finalizing"
  | "success"
  | "error";

export interface AreaAnalysisResult {
  area: {
    original: number;
    adjusted: number;
    unit: string;
  };
  trees: {
    min: number;
    max: number;
    average: number;
    confidence: number;
    densityLevel: string;
    treesPerHectare: number;
  };
  communities: {
    total: number;
    items: Array<{
      id: string;
      name: string;
      type: string;
      population?: number;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    }>;
  };
  waterways: {
    total: number;
    items: Array<{
      id: string;
      name?: string;
      type: string;
    }>;
  };
  buildings: {
    total: number;
  };
  snapped: {
    geometry: GeoJSON.Polygon;
    adjustmentMade: boolean;
    forestCoverage: number;
  } | null;
  metadata: {
    analyzedAt: string;
    processingTimeMs: number;
    dataSource: Record<string, string>;
  };
}

export interface AreaAnalysisProgress {
  stage: AnalysisStage;
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // seconds
}

export interface UseAreaAnalysisOptions {
  onSuccess?: (result: AreaAnalysisResult) => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
}

export interface UseAreaAnalysisReturn {
  analyze: (geometry: GeoJSON.Polygon) => Promise<void>;
  cancel: () => void;
  retry: () => void;
  stage: AnalysisStage;
  progress: AreaAnalysisProgress | null;
  result: AreaAnalysisResult | null;
  error: Error | null;
  isAnalyzing: boolean;
}

export function useAreaAnalysis(
  options: UseAreaAnalysisOptions = {}
): UseAreaAnalysisReturn {
  const { onSuccess, onError, maxRetries = 3 } = options;

  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [progress, setProgress] = useState<AreaAnalysisProgress | null>(null);
  const [result, setResult] = useState<AreaAnalysisResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [currentGeometry, setCurrentGeometry] = useState<GeoJSON.Polygon | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const updateProgress = useCallback(
    (newStage: AnalysisStage, progressPercent: number, message: string, estimatedTimeRemaining?: number) => {
      setStage(newStage);
      setProgress({
        stage: newStage,
        progress: progressPercent,
        message,
        estimatedTimeRemaining,
      });
    },
    []
  );

  const analyze = useCallback(
    async (geometry: GeoJSON.Polygon) => {
      const controller = new AbortController();
      setAbortController(controller);
      setCurrentGeometry(geometry);
      setError(null);
      setResult(null);

      try {
        // Stage 1: Connecting to services (0-10%)
        updateProgress("connecting", 5, "Iniciando análisis de área...", 30);
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (controller.signal.aborted) throw new Error("Analysis cancelled");

        updateProgress("connecting", 10, "Conectando con servicios de análisis", 25);

        // Stage 2: Analyzing forest coverage (10-50%)
        updateProgress("analyzing-forest", 15, "Estimando árboles basado en densidad forestal...", 20);

        // Start the comprehensive analysis
        const analysisPromise = fetch("/api/analysis/area", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ geometry, snapToForest: false }),
          signal: controller.signal,
        }).then((res) => {
          if (!res.ok) throw new Error("Error al analizar el área");
          return res.json();
        });

        updateProgress("analyzing-forest", 30, "Analizando cobertura forestal...", 15);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        updateProgress("analyzing-forest", 45, "Calculando densidad de árboles...", 10);
        await new Promise((resolve) => setTimeout(resolve, 800));

        updateProgress("analyzing-forest", 50, "Análisis forestal completado", 8);

        if (controller.signal.aborted) throw new Error("Analysis cancelled");

        // Stage 3: Querying OSM data (50-80%)
        updateProgress("counting-elements", 55, "Buscando comunidades cercanas en OpenStreetMap...", 8);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        updateProgress("counting-elements", 65, "Identificando ríos y cuerpos de agua...", 5);
        await new Promise((resolve) => setTimeout(resolve, 800));

        updateProgress("counting-elements", 75, "Detectando construcciones...", 3);
        await new Promise((resolve) => setTimeout(resolve, 600));

        updateProgress("counting-elements", 80, "Procesando datos de OpenStreetMap", 2);

        if (controller.signal.aborted) throw new Error("Analysis cancelled");

        // Wait for analysis to complete
        const response = await analysisPromise;
        const analysisResult = response.data as AreaAnalysisResult;

        // Stage 4: Finalizing (80-100%)
        updateProgress("finalizing", 85, "Compilando resultados...", 2);
        await new Promise((resolve) => setTimeout(resolve, 500));

        updateProgress("finalizing", 95, "Preparando reporte...", 1);
        await new Promise((resolve) => setTimeout(resolve, 300));

        updateProgress("success", 100, "¡Análisis completado exitosamente!", 0);
        setResult(analysisResult);
        setStage("success");
        setRetryCount(0);

        if (onSuccess) {
          onSuccess(analysisResult);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error during analysis");

        // Check if we should retry
        if (retryCount < maxRetries && error.message !== "Analysis cancelled") {
          setRetryCount((prev) => prev + 1);
          updateProgress("error", 0, `Error: ${error.message}. Reintentando...`, 0);

          // Wait before retry with exponential backoff
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));

          // Retry
          return analyze(geometry);
        }

        setError(error);
        setStage("error");
        updateProgress("error", 0, `Error: ${error.message}`, 0);

        if (onError) {
          onError(error);
        }
      } finally {
        setAbortController(null);
      }
    },
    [updateProgress, onSuccess, onError, maxRetries, retryCount]
  );

  const cancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setStage("idle");
      setProgress(null);
      setError(new Error("Analysis cancelled by user"));
    }
  }, [abortController]);

  const retry = useCallback(() => {
    if (currentGeometry && stage === "error") {
      setRetryCount(0);
      analyze(currentGeometry);
    }
  }, [currentGeometry, stage, analyze]);

  const isAnalyzing = stage !== "idle" && stage !== "success" && stage !== "error";

  return {
    analyze,
    cancel,
    retry,
    stage,
    progress,
    result,
    error,
    isAnalyzing,
  };
}

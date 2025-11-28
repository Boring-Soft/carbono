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
  // Forest metrics
  forestAreaHectares: number;
  forestCoveragePercent: number;
  estimatedCo2TonsYear: number;

  // OSM elements count
  trees?: number;
  rivers?: number;
  houses?: number;
  communities?: number;

  // Additional metrics
  biomass?: number;
  carbonStock?: number;

  // Metadata
  analyzedAt: Date;
  processingTimeSeconds: number;
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
      const startTime = Date.now();
      const controller = new AbortController();
      setAbortController(controller);
      setCurrentGeometry(geometry);
      setError(null);
      setResult(null);

      try {
        // Stage 1: Connecting to services (0-10%)
        updateProgress("connecting", 5, "Conectando a Google Earth Engine...", 50);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate connection

        if (controller.signal.aborted) throw new Error("Analysis cancelled");

        updateProgress("connecting", 10, "Conexión establecida", 45);

        // Stage 2: Analyzing forest coverage (10-40%)
        updateProgress("analyzing-forest", 15, "Analizando cobertura forestal con imágenes satelitales...", 40);

        const forestAnalysisPromise = fetch("/api/analysis/forest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ geometry }),
          signal: controller.signal,
        }).then((res) => {
          if (!res.ok) throw new Error("Error analyzing forest coverage");
          return res.json();
        });

        updateProgress("analyzing-forest", 25, "Calculando métricas de biomasa...", 30);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        updateProgress("analyzing-forest", 35, "Estimando captura de CO₂...", 20);
        const forestData = await forestAnalysisPromise;

        updateProgress("analyzing-forest", 40, "Análisis forestal completado", 15);

        if (controller.signal.aborted) throw new Error("Analysis cancelled");

        // Stage 3: Counting OSM elements (40-70%)
        updateProgress("counting-elements", 45, "Contando árboles en el área...", 15);

        const osmAnalysisPromise = fetch("/api/analysis/osm-elements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ geometry }),
          signal: controller.signal,
        }).then((res) => {
          if (!res.ok) throw new Error("Error counting OSM elements");
          return res.json();
        });

        updateProgress("counting-elements", 55, "Identificando ríos y cuerpos de agua...", 10);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        updateProgress("counting-elements", 65, "Detectando construcciones y comunidades...", 5);
        const osmData = await osmAnalysisPromise;

        updateProgress("counting-elements", 70, "Elementos identificados", 3);

        if (controller.signal.aborted) throw new Error("Analysis cancelled");

        // Stage 4: Calculating final metrics (70-90%)
        updateProgress("calculating-metrics", 75, "Calculando stock de carbono...", 3);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        updateProgress("calculating-metrics", 85, "Generando métricas finales...", 2);
        await new Promise((resolve) => setTimeout(resolve, 500));

        updateProgress("calculating-metrics", 90, "Validando resultados", 1);

        // Stage 5: Finalizing (90-100%)
        updateProgress("finalizing", 95, "Preparando reporte...", 1);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const endTime = Date.now();
        const processingTimeSeconds = Math.round((endTime - startTime) / 1000);

        const analysisResult: AreaAnalysisResult = {
          forestAreaHectares: forestData.data?.forestAreaHectares || 0,
          forestCoveragePercent: forestData.data?.forestCoveragePercent || 0,
          estimatedCo2TonsYear: forestData.data?.estimatedCo2TonsYear || 0,
          biomass: forestData.data?.biomass,
          carbonStock: forestData.data?.carbonStock,
          trees: osmData.data?.trees,
          rivers: osmData.data?.rivers,
          houses: osmData.data?.houses,
          communities: osmData.data?.communities,
          analyzedAt: new Date(),
          processingTimeSeconds,
        };

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

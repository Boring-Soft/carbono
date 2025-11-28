"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Satellite,
  Trees,
  Home,
  Calculator,
  CheckCircle2,
  XCircle,
  Loader2,
  Wifi,
  AlertTriangle,
} from "lucide-react";
import { AnalysisStage, AreaAnalysisProgress } from "@/hooks/use-area-analysis";

interface AreaAnalysisLoaderProps {
  progress: AreaAnalysisProgress;
  onCancel?: () => void;
  onRetry?: () => void;
  className?: string;
}

interface StageConfig {
  icon: React.ReactNode;
  color: string;
  tip: string;
}

const STAGE_CONFIGS: Record<AnalysisStage, StageConfig> = {
  idle: {
    icon: <Calculator className="h-5 w-5" />,
    color: "text-muted-foreground",
    tip: "Preparando análisis del área seleccionada",
  },
  connecting: {
    icon: <Wifi className="h-5 w-5 animate-pulse" />,
    color: "text-blue-500",
    tip: "Estableciendo conexión segura con Google Earth Engine para acceder a datos satelitales",
  },
  "analyzing-forest": {
    icon: <Satellite className="h-5 w-5 animate-pulse" />,
    color: "text-green-500",
    tip: "Procesando imágenes satelitales de alta resolución para detectar cobertura forestal y biomasa",
  },
  "counting-elements": {
    icon: <Trees className="h-5 w-5 animate-pulse" />,
    color: "text-emerald-500",
    tip: "Consultando OpenStreetMap para identificar árboles, ríos, casas y comunidades en el área",
  },
  "calculating-metrics": {
    icon: <Calculator className="h-5 w-5 animate-pulse" />,
    color: "text-indigo-500",
    tip: "Calculando stock de carbono usando factores IPCC y datos de biomasa aérea y subterránea",
  },
  finalizing: {
    icon: <CheckCircle2 className="h-5 w-5 animate-pulse" />,
    color: "text-purple-500",
    tip: "Generando reporte final con todas las métricas y validando resultados",
  },
  success: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: "text-green-600",
    tip: "¡Análisis completado! Los resultados están listos para revisión",
  },
  error: {
    icon: <XCircle className="h-5 w-5" />,
    color: "text-red-500",
    tip: "Ocurrió un error durante el análisis. Por favor, intenta nuevamente",
  },
};

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function AreaAnalysisLoader({
  progress,
  onCancel,
  onRetry,
  className = "",
}: AreaAnalysisLoaderProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const stageConfig = STAGE_CONFIGS[progress.stage];

  // Track elapsed time
  useEffect(() => {
    if (progress.stage === "idle" || progress.stage === "success" || progress.stage === "error") {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [progress.stage]);

  const isError = progress.stage === "error";
  const isSuccess = progress.stage === "success";
  const isAnalyzing = !isError && !isSuccess && progress.stage !== "idle";

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={stageConfig.color}>{stageConfig.icon}</div>
            <div>
              <h3 className="font-semibold text-lg">
                {isSuccess
                  ? "Análisis Completado"
                  : isError
                  ? "Error en el Análisis"
                  : "Analizando Área"}
              </h3>
              <p className="text-sm text-muted-foreground">{progress.message}</p>
            </div>
          </div>
          {isAnalyzing && onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {!isError && (
          <div className="space-y-2">
            <Progress value={progress.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.progress}% completado</span>
              {progress.estimatedTimeRemaining !== undefined && progress.estimatedTimeRemaining > 0 && (
                <span>Tiempo estimado: {formatTime(progress.estimatedTimeRemaining)}</span>
              )}
              {elapsedTime > 0 && <span>Transcurrido: {formatTime(elapsedTime)}</span>}
            </div>
          </div>
        )}

        {/* Educational Tip */}
        <Alert className={isError ? "border-red-500" : isSuccess ? "border-green-500" : ""}>
          {isError ? (
            <AlertTriangle className="h-4 w-4" />
          ) : isSuccess ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          <AlertDescription className="text-sm">{stageConfig.tip}</AlertDescription>
        </Alert>

        {/* Stage Progress Indicators */}
        {isAnalyzing && (
          <div className="flex items-center justify-between pt-2">
            {[
              { stage: "connecting", label: "Conexión" },
              { stage: "analyzing-forest", label: "Bosque" },
              { stage: "counting-elements", label: "Elementos" },
              { stage: "calculating-metrics", label: "Métricas" },
              { stage: "finalizing", label: "Finalizar" },
            ].map((item, index) => {
              const isActive = progress.stage === item.stage;
              const isCompleted =
                progress.progress >
                {
                  connecting: 10,
                  "analyzing-forest": 40,
                  "counting-elements": 70,
                  "calculating-metrics": 90,
                  finalizing: 95,
                }[item.stage as keyof typeof STAGE_CONFIGS];

              return (
                <div key={item.stage} className="flex flex-col items-center gap-1">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isActive
                        ? "bg-primary animate-pulse"
                        : isCompleted
                        ? "bg-green-500"
                        : "bg-muted"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      isActive ? "text-primary font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Error Actions */}
        {isError && onRetry && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
            <Button size="sm" onClick={onRetry}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Success Indicator */}
        {isSuccess && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Resultados disponibles</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

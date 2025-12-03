"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DensityThresholdSlider } from "./density-threshold-slider";
import { useForestMask } from "@/hooks/use-forest-mask";
import { Check, X, Loader2, Filter, AlertTriangle, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface ForestMaskMetadata {
  threshold: number;
  simplifyTolerance: number;
  processedAt: string;
  source: string;
}

interface ForestMaskControlProps {
  geometry: GeoJSON.Polygon | null;
  onApplyFilter: (forestPolygons: GeoJSON.Polygon[], metadata: ForestMaskMetadata) => void;
  className?: string;
}

export function ForestMaskControl({
  geometry,
  onApplyFilter,
  className = "",
}: ForestMaskControlProps) {
  const [threshold, setThreshold] = useState(70);

  const {
    applyMask,
    result,
    isLoading,
    error,
    preview,
    cancelPreview,
    applyFilter,
  } = useForestMask({
    debounceMs: 500,
    onSuccess: () => {
      toast.success("Filtro de bosque aplicado");
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    },
  });

  const handleThresholdChange = (newThreshold: number) => {
    setThreshold(newThreshold);
    if (geometry) {
      applyMask(geometry, newThreshold);
    }
  };

  const handleApplyFilter = () => {
    if (result) {
      onApplyFilter(result.forestPolygons, result.metadata);
      applyFilter();
      toast.success("Filtro aplicado al proyecto");
    }
  };

  const handleCancelPreview = () => {
    cancelPreview();
    toast.info("Filtro cancelado");
  };

  if (!geometry) {
    return (
      <Alert>
        <Filter className="h-4 w-4" />
        <AlertDescription>
          Dibuja un área en el mapa para aplicar el filtro de bosque
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Threshold Slider */}
      <DensityThresholdSlider
        value={threshold}
        onChange={handleThresholdChange}
      />

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Aplicando filtro de bosque...</p>
                <p className="text-xs text-muted-foreground">
                  Analizando cobertura forestal con umbral {threshold}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Results Card */}
      {result && !isLoading && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4 text-green-600" />
              Resultados del Filtro
            </CardTitle>
            <CardDescription>
              Umbral: {result.metadata.threshold}% • {result.fragmentCount} fragmento(s) detectado(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Área Original</p>
                <p className="text-lg font-bold">
                  {result.originalAreaHectares.toLocaleString("es-BO", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  ha
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-green-700">Área Filtrada</p>
                <p className="text-lg font-bold text-green-900">
                  {result.forestAreaHectares.toLocaleString("es-BO", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  ha
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-xs text-red-700">Área Excluida</p>
                <p className="text-lg font-bold text-red-900">
                  {result.excludedAreaHectares.toLocaleString("es-BO", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  ha
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-blue-700" />
                  <p className="text-xs text-blue-700">Reducción</p>
                </div>
                <p className="text-lg font-bold text-blue-900">
                  {result.reductionPercent.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Summary */}
            <Alert>
              <AlertDescription className="text-sm">
                <strong>Resumen:</strong> Se ajustó de{" "}
                <span className="font-medium">
                  {result.originalAreaHectares.toLocaleString("es-BO", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  ha
                </span>{" "}
                a{" "}
                <span className="font-medium text-green-700">
                  {result.forestAreaHectares.toLocaleString("es-BO", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  ha
                </span>{" "}
                (bosque real). Excluidas:{" "}
                <span className="font-medium text-red-700">
                  {result.excludedAreaHectares.toLocaleString("es-BO", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  ha
                </span>{" "}
                de áreas no boscosas.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            {preview && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelPreview}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleApplyFilter}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Aplicar Filtro
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

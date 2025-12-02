"use client";

import { Trees, Users, Droplets, Home, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AreaAnalysisResult } from "@/hooks/use-area-analysis";

interface AreaAnalysisDisplayProps {
  result: AreaAnalysisResult;
}

/**
 * Display area analysis results
 *
 * Shows:
 * - Tree estimation (min-max range with confidence)
 * - Communities found
 * - Waterways
 * - Buildings
 */
export function AreaAnalysisDisplay({ result }: AreaAnalysisDisplayProps) {
  const [expanded, setExpanded] = useState(true);

  const confidenceColor =
    result.trees.confidence >= 85
      ? "text-green-600"
      : result.trees.confidence >= 70
      ? "text-yellow-600"
      : "text-red-600";

  const confidenceLabel =
    result.trees.confidence >= 85
      ? "Alta"
      : result.trees.confidence >= 70
      ? "Media"
      : "Baja";

  return (
    <Card className="p-4 space-y-3 bg-blue-50 border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trees className="h-5 w-5 text-green-700" />
          <h3 className="font-semibold text-sm">Análisis de Área Completado</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="h-6 w-6 p-0"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {expanded && (
        <>
          {/* Trees Estimation */}
          <div className="bg-white rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Trees className="h-4 w-4 text-green-700" />
                  <span className="text-sm font-medium">Árboles Estimados</span>
                </div>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {result.trees.min.toLocaleString("es-BO")} -{" "}
                  {result.trees.max.toLocaleString("es-BO")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Promedio: ~{result.trees.average.toLocaleString("es-BO")} árboles
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.trees.treesPerHectare} árboles/ha
                </p>
              </div>
              <Badge variant="outline" className={confidenceColor}>
                Confianza: {confidenceLabel}
              </Badge>
            </div>
          </div>

          {/* Communities */}
          {result.communities.total > 0 && (
            <div className="bg-white rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-700" />
                <span className="text-sm font-medium">
                  Comunidades ({result.communities.total})
                </span>
              </div>
              <div className="space-y-1">
                {result.communities.items.slice(0, 5).map((community) => (
                  <div
                    key={community.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">{community.name}</span>
                    <div className="flex items-center gap-2">
                      {community.population && (
                        <span className="text-xs text-muted-foreground">
                          {community.population.toLocaleString("es-BO")} hab.
                        </span>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {community.type}
                      </Badge>
                    </div>
                  </div>
                ))}
                {result.communities.total > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    + {result.communities.total - 5} más
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-2">
            {/* Waterways */}
            {result.waterways.total > 0 && (
              <div className="bg-white rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium">
                    {result.waterways.total} Ríos
                  </span>
                </div>
              </div>
            )}

            {/* Buildings */}
            {result.buildings.total > 0 && (
              <div className="bg-white rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Home className="h-3 w-3 text-gray-600" />
                  <span className="text-xs font-medium">
                    {result.buildings.total} Edificios
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Data Source */}
          <p className="text-xs text-muted-foreground text-center pt-1">
            Datos de OpenStreetMap y estimaciones de densidad forestal
          </p>
        </>
      )}
    </Card>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, Satellite } from "lucide-react";

interface GEEAnalysisBadgeProps {
  verified: boolean;
  forestCoveragePercent?: number | null;
  biomassPerHectare?: number | null;
  forestType?: string | null;
  confidence?: number;
  lastCheckDate?: Date | null;
}

export function GEEAnalysisBadge({
  verified,
  forestCoveragePercent,
  biomassPerHectare,
  forestType,
  confidence,
  lastCheckDate,
}: GEEAnalysisBadgeProps) {
  if (!verified) {
    return (
      <Badge variant="outline" className="gap-1">
        <Satellite className="h-3 w-3" />
        No Verificado
      </Badge>
    );
  }

  const tooltipContent = (
    <div className="space-y-2 text-sm">
      <div className="font-semibold flex items-center gap-1">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        Verificado con Google Earth Engine
      </div>

      {forestCoveragePercent !== null && forestCoveragePercent !== undefined && (
        <div>
          <span className="font-medium">Cobertura Forestal:</span>{" "}
          {forestCoveragePercent.toFixed(1)}%
        </div>
      )}

      {biomassPerHectare !== null && biomassPerHectare !== undefined && (
        <div>
          <span className="font-medium">Biomasa:</span>{" "}
          {biomassPerHectare.toFixed(2)} tC/ha
        </div>
      )}

      {forestType && (
        <div>
          <span className="font-medium">Tipo de Bosque:</span> {forestType}
        </div>
      )}

      {confidence !== undefined && (
        <div>
          <span className="font-medium">Confianza:</span> {confidence}%
        </div>
      )}

      {lastCheckDate && (
        <div className="text-xs text-muted-foreground pt-1 border-t">
          Última verificación:{" "}
          {new Date(lastCheckDate).toLocaleDateString("es-BO")}
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="gap-1 bg-green-600 hover:bg-green-700 cursor-help">
            <CheckCircle2 className="h-3 w-3" />
            Verificado con GEE
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

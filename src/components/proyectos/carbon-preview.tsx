"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, DollarSign, TrendingUp } from "lucide-react";
import { CARBON_MARKET_PRICES, formatUSDCompact } from "@/lib/carbon/market-prices";

interface CarbonPreviewProps {
  areaHectares: number;
  estimatedCo2TonsYear: number | null;
  forestType?: string;
  projectType?: string;
}

export function CarbonPreview({
  areaHectares,
  estimatedCo2TonsYear,
  forestType,
  projectType,
}: CarbonPreviewProps) {
  if (!estimatedCo2TonsYear || estimatedCo2TonsYear <= 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Estimación de Captura de Carbono
          </CardTitle>
          <CardDescription>
            Completa la información del proyecto para ver la estimación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Dibuja el polígono del proyecto en el mapa para calcular la captura de CO₂
          </div>
        </CardContent>
      </Card>
    );
  }

  const revenueConservative = estimatedCo2TonsYear * CARBON_MARKET_PRICES.conservative.pricePerTon;
  const revenueRealistic = estimatedCo2TonsYear * CARBON_MARKET_PRICES.realistic.pricePerTon;
  const revenueOptimistic = estimatedCo2TonsYear * CARBON_MARKET_PRICES.optimistic.pricePerTon;

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          Estimación de Captura de Carbono
        </CardTitle>
        <CardDescription>
          Proyección basada en análisis satelital y factores IPCC
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Area and CO2 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Área del Proyecto
            </div>
            <div className="text-2xl font-bold text-green-700">
              {areaHectares.toLocaleString("es-BO", { maximumFractionDigits: 2 })}
              <span className="text-lg font-normal ml-1">ha</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Captura Anual Estimada
            </div>
            <div className="text-2xl font-bold text-green-700">
              {estimatedCo2TonsYear.toLocaleString("es-BO", { maximumFractionDigits: 0 })}
              <span className="text-lg font-normal ml-1">tCO₂/año</span>
            </div>
          </div>
        </div>

        {/* Forest and Project Type */}
        {(forestType || projectType) && (
          <div className="flex items-center gap-2 text-sm">
            {forestType && (
              <Badge variant="outline" className="bg-white">
                {forestType}
              </Badge>
            )}
            {projectType && (
              <Badge variant="outline" className="bg-white">
                {projectType}
              </Badge>
            )}
          </div>
        )}

        {/* Revenue Estimates */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span>Ingresos Potenciales Anuales</span>
          </div>

          <div className="space-y-2">
            {/* Conservative */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <div className="text-sm font-medium">Conservador</div>
                <div className="text-xs text-muted-foreground">
                  ${CARBON_MARKET_PRICES.conservative.pricePerTon}/tCO₂
                </div>
              </div>
              <div className="text-lg font-bold text-green-700">
                {formatUSDCompact(revenueConservative)}
              </div>
            </div>

            {/* Realistic */}
            <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg border border-green-300">
              <div>
                <div className="text-sm font-medium flex items-center gap-1">
                  Realista
                  <Badge variant="secondary" className="ml-1">Recomendado</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  ${CARBON_MARKET_PRICES.realistic.pricePerTon}/tCO₂
                </div>
              </div>
              <div className="text-lg font-bold text-green-700">
                {formatUSDCompact(revenueRealistic)}
              </div>
            </div>

            {/* Optimistic */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <div className="text-sm font-medium">Optimista</div>
                <div className="text-xs text-muted-foreground">
                  ${CARBON_MARKET_PRICES.optimistic.pricePerTon}/tCO₂
                </div>
              </div>
              <div className="text-lg font-bold text-green-700">
                {formatUSDCompact(revenueOptimistic)}
              </div>
            </div>
          </div>
        </div>

        {/* 10-year projection */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Proyección 10 años (escenario realista)</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {formatUSDCompact(revenueRealistic * 10)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Basado en captura constante anual
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground bg-white p-3 rounded border">
          <strong>Nota:</strong> Estas son estimaciones preliminares. Los valores finales dependerán
          de la verificación satelital con Google Earth Engine y la certificación del proyecto.
        </div>
      </CardContent>
    </Card>
  );
}

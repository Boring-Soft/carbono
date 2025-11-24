"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, MapPin, Leaf, DollarSign, AlertTriangle } from "lucide-react";
import { formatUSDCompact } from "@/lib/carbon/market-prices";

interface StatsCardsProps {
  stats: {
    totalHectares: number;
    totalCo2Year: number;
    revenueEstimates: {
      conservative: number;
      realistic: number;
      optimistic: number;
    };
    recentAlerts: number;
    alertTrend: number;
    projectCount: number;
  } | null;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cargando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Total Hectares Protected */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hectáreas Protegidas</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {stats.totalHectares.toLocaleString("es-BO", {
              maximumFractionDigits: 0,
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.projectCount} proyectos certificados/activos
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Total CO₂ Captured */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Captura Anual CO₂</CardTitle>
          <Leaf className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-700">
            {stats.totalCo2Year.toLocaleString("es-BO", {
              maximumFractionDigits: 0,
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            toneladas de CO₂/año
          </p>
        </CardContent>
      </Card>

      {/* Card 3: Revenue Potential */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Potenciales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-emerald-700">
            {formatUSDCompact(stats.revenueEstimates.realistic)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              Escenario realista ($15/tCO₂)
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Min: {formatUSDCompact(stats.revenueEstimates.conservative)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Max: {formatUSDCompact(stats.revenueEstimates.optimistic)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Recent Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-4xl font-bold text-orange-700">
              {stats.recentAlerts}
            </div>
            {stats.recentAlerts > 0 && (
              <Badge variant="destructive" className="text-xs">
                48h
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {stats.alertTrend !== 0 && (
              <>
                {stats.alertTrend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-red-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
                <p
                  className={`text-xs font-medium ${
                    stats.alertTrend > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {Math.abs(stats.alertTrend).toFixed(1)}%
                </p>
              </>
            )}
            <p className="text-xs text-muted-foreground">
              vs período anterior
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trees, TrendingDown, MapPin, RefreshCw, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DepartmentStats {
  department: string;
  forestAreaHectares: number;
  coveragePercent: number;
  lossLastYear: number;
}

interface HistoricalDataPoint {
  year: number;
  forestAreaHectares: number;
  lossHectares: number;
}

interface NationalForestStatsData {
  totalForestHectares: number;
  totalCoveragePercent: number;
  annualLossHectares: number;
  leadingDepartment: string;
  departmentStats: DepartmentStats[];
  historicalTrend: HistoricalDataPoint[];
  lastUpdated: string;
}

async function fetchNationalForestStats(refresh = false): Promise<NationalForestStatsData> {
  const url = refresh
    ? "/api/national/forest-stats?refresh=true"
    : "/api/national/forest-stats";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Error al cargar estadísticas forestales nacionales");
  }
  const data = await response.json();
  return data.data;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
}

export function NationalForestStats() {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["national-forest-stats"],
    queryFn: () => fetchNationalForestStats(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchInterval: false,
  });

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar estadísticas forestales nacionales. Por favor, intenta nuevamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventario Forestal Nacional</h2>
          <p className="text-muted-foreground">Estadísticas de cobertura forestal en Bolivia</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Total Forest Area */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bosques Totales</CardTitle>
            <Trees className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatNumber(stats?.totalForestHectares || 0)} ha
                </div>
                <p className="text-xs text-muted-foreground">
                  ~{(stats?.totalForestHectares || 0 / 1000000).toFixed(1)} millones de hectáreas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Coverage Percentage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobertura Nacional</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalCoveragePercent.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Del territorio nacional
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Annual Loss */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pérdida Anual</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">
                  -{formatNumber(stats?.annualLossHectares || 0)} ha
                </div>
                <p className="text-xs text-muted-foreground">
                  Deforestación por año
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Leading Department */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departamento Líder</CardTitle>
            <Trees className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.leadingDepartment}</div>
                <p className="text-xs text-muted-foreground">
                  Mayor cobertura forestal
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Bar Chart - Forest by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Bosques por Departamento</CardTitle>
            <CardDescription>Hectáreas de cobertura forestal</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.departmentStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="department"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={(value) => formatNumber(value)}
                    fontSize={12}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toLocaleString("es-BO")} ha`,
                      "Bosques",
                    ]}
                  />
                  <Bar dataKey="forestAreaHectares" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Line Chart - Historical Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Histórica</CardTitle>
            <CardDescription>Evolución 2000-2023</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.historicalTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    fontSize={12}
                    tickFormatter={(value) => value.toString()}
                  />
                  <YAxis
                    tickFormatter={(value) => formatNumber(value)}
                    fontSize={12}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      const label = name === "forestAreaHectares" ? "Bosques" : "Pérdida";
                      return [`${value.toLocaleString("es-BO")} ha`, label];
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="forestAreaHectares"
                    stroke="#22c55e"
                    name="Cobertura Total"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="lossHectares"
                    stroke="#ef4444"
                    name="Pérdida Anual"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

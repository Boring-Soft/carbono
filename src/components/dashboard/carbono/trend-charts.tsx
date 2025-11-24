"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ProjectType } from "@prisma/client";

const TYPE_LABELS: Record<ProjectType, string> = {
  REDD_PLUS: "REDD+",
  REFORESTATION: "Reforestación",
  RENEWABLE_ENERGY: "Energía Renovable",
  REGENERATIVE_AGRICULTURE: "Agricultura Regenerativa",
  COMMUNITY_CONSERVATION: "Conservación Comunitaria",
};

const TYPE_COLORS: Record<ProjectType, string> = {
  REDD_PLUS: "#22c55e",
  REFORESTATION: "#3b82f6",
  RENEWABLE_ENERGY: "#f59e0b",
  REGENERATIVE_AGRICULTURE: "#8b5cf6",
  COMMUNITY_CONSERVATION: "#06b6d4",
};

interface TrendChartsProps {
  trends: {
    monthlyDeforestation: Array<{
      month: string;
      count: number;
      high: number;
    }>;
    co2ByDepartment: Array<{
      department: string;
      co2TonsYear: number;
      hectares: number;
      projectCount: number;
    }>;
    projectDistribution: Array<{
      type: ProjectType;
      count: number;
    }>;
    forestCoverageData: Array<{
      date: string;
      coverage: number | null;
    }>;
  } | null;
  isLoading?: boolean;
}

export function TrendCharts({ trends, isLoading }: TrendChartsProps) {
  if (isLoading || !trends) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Cargando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Cargando datos...</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Prepare monthly deforestation data
  const deforestationData = trends.monthlyDeforestation.map((item) => ({
    month: new Date(item.month + "-01").toLocaleDateString("es-BO", {
      month: "short",
      year: "2-digit",
    }),
    total: item.count,
    alta: item.high,
  }));

  // Prepare CO2 by department data - sorted by CO2 desc
  const co2Data = [...trends.co2ByDepartment]
    .sort((a, b) => b.co2TonsYear - a.co2TonsYear)
    .slice(0, 9); // Top 9 departments

  // Prepare project distribution data
  const distributionData = trends.projectDistribution.map((item) => ({
    name: TYPE_LABELS[item.type],
    value: item.count,
    color: TYPE_COLORS[item.type],
  }));

  // Prepare forest coverage data - filter nulls and take recent data
  const coverageData = trends.forestCoverageData
    .filter((item) => item.coverage !== null)
    .slice(0, 30)
    .reverse()
    .map((item) => ({
      date: item.date
        ? new Date(item.date).toLocaleDateString("es-BO", {
            month: "short",
            day: "numeric",
          })
        : "",
      coverage: item.coverage,
    }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Chart 1: Monthly Deforestation */}
      <Card>
        <CardHeader>
          <CardTitle>Deforestación Mensual</CardTitle>
          <CardDescription>Últimos 12 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={deforestationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#f97316"
                strokeWidth={2}
                name="Total Alertas"
              />
              <Line
                type="monotone"
                dataKey="alta"
                stroke="#ef4444"
                strokeWidth={2}
                name="Alta Severidad"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 2: CO2 by Department */}
      <Card>
        <CardHeader>
          <CardTitle>Captura de CO₂ por Departamento</CardTitle>
          <CardDescription>Toneladas de CO₂/año</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={co2Data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="department"
                tick={{ fontSize: 11 }}
                width={80}
              />
              <Tooltip
                formatter={(value: number) =>
                  value.toLocaleString("es-BO", { maximumFractionDigits: 0 })
                }
              />
              <Bar dataKey="co2TonsYear" fill="#22c55e" name="tCO₂/año" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 3: Project Distribution by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Proyectos por Tipo</CardTitle>
          <CardDescription>Total de proyectos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 4: Forest Coverage Evolution */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Cobertura Forestal</CardTitle>
          <CardDescription>Verificaciones GEE recientes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={coverageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
                label={{ value: "%", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Area
                type="monotone"
                dataKey="coverage"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.3}
                name="Cobertura Forestal"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { ReportGeneratorForm } from "@/components/reportes/report-generator-form";
import { ReportHistoryTable } from "@/components/reportes/report-history-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, History, BarChart3 } from "lucide-react";
import { useState } from "react";

interface GeneratedReport {
  id: string;
  reportType: string;
  format: "PDF" | "EXCEL";
  title: string;
  fileName: string;
  fileUrl: string;
  fileSizeKb: number | null;
  generatedBy: string | null;
  generatedAt: Date;
  parameters: any;
  status: string;
}

async function fetchReports(type?: string): Promise<GeneratedReport[]> {
  const params = new URLSearchParams();
  if (type && type !== "all") {
    params.append("type", type);
  }

  const response = await fetch(`/api/reports?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Error al cargar reportes");
  }

  const data = await response.json();
  return data.data || [];
}

export default function ReportesPage() {
  const [filterType, setFilterType] = useState<string>("all");

  const {
    data: reports = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["reports", filterType],
    queryFn: () => fetchReports(filterType),
  });

  const reportStats = {
    total: reports.length,
    pdf: reports.filter((r) => r.format === "PDF").length,
    excel: reports.filter((r) => r.format === "EXCEL").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-muted-foreground mt-1">
          Genera y gestiona reportes del sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reportes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.total}</div>
            <p className="text-xs text-muted-foreground">Generados en total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reportes PDF</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.pdf}</div>
            <p className="text-xs text-muted-foreground">Documentos PDF</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reportes Excel</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.excel}</div>
            <p className="text-xs text-muted-foreground">Hojas de cálculo</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">
            <FileText className="h-4 w-4 mr-2" />
            Generar Reporte
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <ReportGeneratorForm onGenerated={() => refetch()} />

            {/* Quick Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Guía Rápida</CardTitle>
                <CardDescription>Tipos de reportes disponibles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Reporte Nacional</h4>
                  <p className="text-sm text-muted-foreground">
                    Vista general de todos los proyectos a nivel nacional, incluyendo
                    métricas agregadas, desglose por departamento y alertas recientes.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Reporte Departamental</h4>
                  <p className="text-sm text-muted-foreground">
                    Análisis detallado de proyectos en un departamento específico,
                    con lista completa de proyectos y alertas por municipio.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Reporte de Proyecto</h4>
                  <p className="text-sm text-muted-foreground">
                    Información completa de un proyecto individual, incluyendo
                    métricas de carbono, historial de estados y documentos.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Reporte Mensual</h4>
                  <p className="text-sm text-muted-foreground">
                    Resumen de actividad del mes: nuevos proyectos, cambios de
                    estado y alertas detectadas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filtrar por tipo:</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="NATIONAL">Nacional</SelectItem>
                <SelectItem value="DEPARTMENT">Departamental</SelectItem>
                <SelectItem value="PROJECT">Proyecto</SelectItem>
                <SelectItem value="MONTHLY">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* History Table */}
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Cargando reportes...</p>
              </CardContent>
            </Card>
          ) : (
            <ReportHistoryTable reports={reports} onDelete={() => refetch()} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

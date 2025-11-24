"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertsTable } from "@/components/alertas/alerts-table";
import { AlertDetailDialog } from "@/components/alertas/alert-detail-dialog";
import { AlertListItem } from "@/types/alert";
import { AlertMarkerData } from "@/components/maps/alert-marker";
import { AlertTriangle, Map } from "lucide-react";

// Dynamically import CarbonMap to avoid SSR issues with Leaflet
const CarbonMap = dynamic(
  () => import("@/components/dashboard/carbono/carbon-map").then((mod) => mod.CarbonMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[700px] flex items-center justify-center bg-muted rounded-lg">
        <div className="text-muted-foreground">Cargando mapa...</div>
      </div>
    ),
  }
);

async function fetchAlerts() {
  const response = await fetch("/api/alerts?limit=100");
  if (!response.ok) {
    throw new Error("Error al cargar alertas");
  }
  const data = await response.json();
  return data.data as AlertListItem[];
}

export default function AlertasPage() {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: alerts = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const handleAlertClick = (alert: AlertListItem) => {
    setSelectedAlertId(alert.id);
    setIsDialogOpen(true);
  };

  const handleStatusChanged = () => {
    refetch();
  };

  // Convert alerts to marker data
  const alertMarkers: AlertMarkerData[] = alerts.map((alert) => ({
    id: alert.id,
    latitude: alert.latitude,
    longitude: alert.longitude,
    severity: alert.severity,
    detectedAt: alert.detectedAt,
    confidence: alert.confidence,
    brightness: alert.brightness,
    nearProjectDistance: alert.nearProjectDistance,
  }));

  // Statistics
  const stats = {
    total: alerts.length,
    new: alerts.filter((a) => a.status === "NEW").length,
    investigating: alerts.filter((a) => a.status === "INVESTIGATING").length,
    high: alerts.filter((a) => a.severity === "HIGH").length,
    nearProjects: alerts.filter((a) => a.nearProject !== null).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Alertas de Deforestación
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitoreo en tiempo real de alertas detectadas por NASA FIRMS
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">alertas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <p className="text-xs text-muted-foreground">sin revisar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investigando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.investigating}
            </div>
            <p className="text-xs text-muted-foreground">en proceso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Severidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.high}</div>
            <p className="text-xs text-muted-foreground">críticas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cerca de Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.nearProjects}
            </div>
            <p className="text-xs text-muted-foreground">requieren atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Tabla</TabsTrigger>
          <TabsTrigger value="map">
            <Map className="h-4 w-4 mr-2" />
            Mapa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Alertas</CardTitle>
              <CardDescription>
                Todas las alertas detectadas, ordenadas por fecha
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Cargando alertas...
                </div>
              ) : (
                <AlertsTable
                  alerts={alerts}
                  onAlertClick={handleAlertClick}
                  onStatusChanged={handleStatusChanged}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <CarbonMap
            projects={[]}
            alerts={alertMarkers}
            showProjects={false}
            showAlerts={true}
            className="w-full h-[700px]"
          />
        </TabsContent>
      </Tabs>

      {/* Alert Detail Dialog */}
      <AlertDetailDialog
        alertId={selectedAlertId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatsCards } from "@/components/dashboard/carbono/stats-cards";
import { CarbonMap } from "@/components/dashboard/carbono/carbon-map";
import { MapControls } from "@/components/dashboard/carbono/map-controls";
import { FiltersBar, DashboardFilters } from "@/components/dashboard/carbono/filters-bar";
import { TrendCharts } from "@/components/dashboard/carbono/trend-charts";
import { ProjectMarkerData } from "@/components/maps/project-marker";
import { AlertMarkerData } from "@/components/maps/alert-marker";
import { ProjectStatus } from "@prisma/client";

async function fetchDashboardStats() {
  const response = await fetch("/api/dashboard/stats");
  if (!response.ok) {
    throw new Error("Error al cargar estadísticas");
  }
  const data = await response.json();
  return data.data;
}

async function fetchDashboardTrends() {
  const response = await fetch("/api/dashboard/trends");
  if (!response.ok) {
    throw new Error("Error al cargar tendencias");
  }
  const data = await response.json();
  return data.data;
}

interface ProjectApiResponse {
  id: string;
  name: string;
  status: string;
  type: string;
  areaHectares: number;
  estimatedCo2TonsYear: number;
  geometry: {
    coordinates: number[][][];
  };
}

async function fetchProjects(filters: DashboardFilters) {
  const params = new URLSearchParams();
  if (filters.department) params.append("department", filters.department);
  if (filters.projectType) params.append("type", filters.projectType);
  if (filters.status) params.append("status", filters.status);
  if (filters.dateFrom) params.append("dateFrom", filters.dateFrom.toISOString());
  if (filters.dateTo) params.append("dateTo", filters.dateTo.toISOString());

  const response = await fetch(`/api/projects?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Error al cargar proyectos");
  }
  const data = await response.json();

  // Transform to marker data
  return data.data.map((project: ProjectApiResponse): ProjectMarkerData => {
    // Extract centroid from geometry
    const coordinates = project.geometry.coordinates[0];
    const lats = coordinates.map((coord: number[]) => coord[1]);
    const lngs = coordinates.map((coord: number[]) => coord[0]);
    const latitude = lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
    const longitude = lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length;

    return {
      id: project.id,
      name: project.name,
      status: project.status as ProjectStatus,
      type: project.type,
      areaHectares: project.areaHectares,
      estimatedCo2TonsYear: project.estimatedCo2TonsYear,
      latitude,
      longitude,
    };
  });
}

interface AlertApiResponse {
  id: string;
  latitude: number;
  longitude: number;
  severity: string;
  detectedAt: string;
  confidence: number;
  brightness: number;
  nearProjectDistance: number | null;
}

async function fetchAlerts(filters: DashboardFilters) {
  const params = new URLSearchParams();
  if (filters.department) params.append("department", filters.department);
  if (filters.dateFrom) params.append("dateFrom", filters.dateFrom.toISOString());
  if (filters.dateTo) params.append("dateTo", filters.dateTo.toISOString());

  const response = await fetch(`/api/alerts?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Error al cargar alertas");
  }
  const data = await response.json();

  return data.data.map((alert: AlertApiResponse): AlertMarkerData => ({
    id: alert.id,
    latitude: alert.latitude,
    longitude: alert.longitude,
    severity: alert.severity as "LOW" | "MEDIUM" | "HIGH",
    detectedAt: new Date(alert.detectedAt),
    confidence: alert.confidence,
    brightness: alert.brightness,
    nearProjectDistance: alert.nearProjectDistance,
  }));
}

export default function DashboardCarbonoPage() {
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [showProjects, setShowProjects] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [satelliteView, setSatelliteView] = useState(false);

  // Fetch dashboard data with React Query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ["dashboard-trends"],
    queryFn: fetchDashboardTrends,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["dashboard-projects", filters],
    queryFn: () => fetchProjects(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["dashboard-alerts", filters],
    queryFn: () => fetchAlerts(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard de Carbono
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitoreo nacional de proyectos de carbono y alertas de deforestación
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} isLoading={statsLoading} />

      {/* Filters */}
      <FiltersBar filters={filters} onFiltersChange={setFilters} />

      {/* Map Section */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-3">
          <CarbonMap
            projects={projects}
            alerts={alerts}
            showProjects={showProjects}
            showAlerts={showAlerts}
            satelliteView={satelliteView}
            className="w-full h-[600px]"
          />
        </div>
        <div>
          <MapControls
            showProjects={showProjects}
            showAlerts={showAlerts}
            satelliteView={satelliteView}
            onToggleProjects={setShowProjects}
            onToggleAlerts={setShowAlerts}
            onToggleSatelliteView={setSatelliteView}
          />
        </div>
      </div>

      {/* Trend Charts */}
      <TrendCharts trends={trends} isLoading={trendsLoading} />
    </div>
  );
}

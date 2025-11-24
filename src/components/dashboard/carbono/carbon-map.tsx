"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createProjectMarker, ProjectMarkerData } from "@/components/maps/project-marker";
import { createAlertMarker, AlertMarkerData } from "@/components/maps/alert-marker";

// Dynamic import to avoid SSR issues
const LeafletMap = dynamic(
  () => import("@/components/maps/leaflet-map").then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface CarbonMapProps {
  projects: ProjectMarkerData[];
  alerts: AlertMarkerData[];
  showProjects?: boolean;
  showAlerts?: boolean;
  satelliteView?: boolean;
  className?: string;
}

export function CarbonMap({
  projects,
  alerts,
  showProjects = true,
  showAlerts = true,
  satelliteView = false,
  className = "w-full h-[600px]",
}: CarbonMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const projectLayerRef = useRef<L.LayerGroup | null>(null);
  const alertLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize layers when map is ready
  const handleMapReady = (mapInstance: L.Map) => {
    setMap(mapInstance);

    // Create layer groups
    const projectLayer = L.layerGroup().addTo(mapInstance);
    const alertLayer = L.layerGroup().addTo(mapInstance);

    projectLayerRef.current = projectLayer;
    alertLayerRef.current = alertLayer;
  };

  // Update project markers
  useEffect(() => {
    if (!map || !projectLayerRef.current) return;

    const layer = projectLayerRef.current;
    layer.clearLayers();

    if (showProjects && projects.length > 0) {
      // Simple clustering logic for >100 markers
      if (projects.length > 100) {
        // Create marker cluster manually
        const bounds = L.latLngBounds(projects.map(p => [p.latitude, p.longitude]));
        const zoom = map.getZoom();

        if (zoom < 8) {
          // Show aggregated markers at low zoom
          const grid: { [key: string]: ProjectMarkerData[] } = {};
          const gridSize = 1; // degrees

          projects.forEach(project => {
            const lat = Math.floor(project.latitude / gridSize) * gridSize;
            const lng = Math.floor(project.longitude / gridSize) * gridSize;
            const key = `${lat},${lng}`;

            if (!grid[key]) {
              grid[key] = [];
            }
            grid[key].push(project);
          });

          // Create cluster markers
          Object.entries(grid).forEach(([key, clusteredProjects]) => {
            if (clusteredProjects.length === 1) {
              const marker = createProjectMarker(clusteredProjects[0]);
              layer.addLayer(marker);
            } else {
              const [lat, lng] = key.split(',').map(Number);
              const centerLat = lat + gridSize / 2;
              const centerLng = lng + gridSize / 2;

              const clusterIcon = L.divIcon({
                className: 'custom-cluster-marker',
                html: `
                  <div style="
                    background-color: #22c55e;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-weight: bold;
                    color: white;
                  ">
                    ${clusteredProjects.length}
                  </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20],
              });

              const marker = L.marker([centerLat, centerLng], { icon: clusterIcon });
              marker.on('click', () => {
                map.fitBounds(L.latLngBounds(clusteredProjects.map(p => [p.latitude, p.longitude])));
              });
              layer.addLayer(marker);
            }
          });
        } else {
          // Show individual markers at high zoom
          projects.forEach((project) => {
            const marker = createProjectMarker(project);
            layer.addLayer(marker);
          });
        }
      } else {
        // Show all markers normally if <100
        projects.forEach((project) => {
          const marker = createProjectMarker(project);
          layer.addLayer(marker);
        });
      }
    }
  }, [map, projects, showProjects]);

  // Update alert markers
  useEffect(() => {
    if (!map || !alertLayerRef.current) return;

    const layer = alertLayerRef.current;
    layer.clearLayers();

    if (showAlerts && alerts.length > 0) {
      alerts.forEach((alert) => {
        const marker = createAlertMarker(alert);
        layer.addLayer(marker);
      });
    }
  }, [map, alerts, showAlerts]);

  // Toggle layer visibility
  useEffect(() => {
    if (!map) return;

    if (projectLayerRef.current) {
      if (showProjects) {
        projectLayerRef.current.addTo(map);
      } else {
        projectLayerRef.current.remove();
      }
    }

    if (alertLayerRef.current) {
      if (showAlerts) {
        alertLayerRef.current.addTo(map);
      } else {
        alertLayerRef.current.remove();
      }
    }
  }, [map, showProjects, showAlerts]);

  return (
    <Card className={className}>
      <LeafletMap
        onMapReady={handleMapReady}
        satelliteView={satelliteView}
        className="w-full h-full rounded-lg"
      />
    </Card>
  );
}

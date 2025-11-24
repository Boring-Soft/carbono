"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Bolivia bounds
const BOLIVIA_CENTER: [number, number] = [-16.5, -64.5];
const BOLIVIA_BOUNDS: [[number, number], [number, number]] = [
  [-23, -70],
  [-10, -58],
];

interface LeafletMapProps {
  onMapReady?: (map: L.Map) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  id?: string;
  satelliteView?: boolean;
}

export function LeafletMap({
  onMapReady,
  center = BOLIVIA_CENTER,
  zoom = 6,
  className = "w-full h-full",
  id = "map",
  satelliteView = false,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current, {
      center,
      zoom,
      maxBounds: BOLIVIA_BOUNDS,
      maxBoundsViscosity: 0.8,
      zoomControl: true,
    });

    mapRef.current = map;

    // Add tile layer based on view type
    if (satelliteView) {
      // Satellite view using Esri World Imagery
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 19,
        }
      ).addTo(map);
    } else {
      // Standard OpenStreetMap view
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
    }

    // Call onMapReady callback
    if (onMapReady) {
      onMapReady(map);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, zoom, satelliteView]);

  return <div ref={containerRef} id={id} className={className} />;
}

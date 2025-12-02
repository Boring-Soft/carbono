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

// Tile layer configurations
type TileLayerConfig = {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
};

export const TILE_LAYERS: Record<string, TileLayerConfig> = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 19,
  },
  satelliteGoogle: {
    url: "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    attribution: "&copy; Google",
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  },
};

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
  const currentLayerRef = useRef<L.TileLayer | null>(null);

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

    // Add initial tile layer
    const layerConfig = satelliteView ? TILE_LAYERS.satellite : TILE_LAYERS.street;
    const tileLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
      ...(layerConfig.subdomains && { subdomains: layerConfig.subdomains }),
    });
    tileLayer.addTo(map);
    currentLayerRef.current = tileLayer;

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
  }, [center, zoom]);

  // Handle view mode changes dynamically
  useEffect(() => {
    if (!mapRef.current || !currentLayerRef.current) return;

    // Remove current layer
    mapRef.current.removeLayer(currentLayerRef.current);

    // Add new layer based on view mode
    const layerConfig = satelliteView ? TILE_LAYERS.satellite : TILE_LAYERS.street;
    const newTileLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
      ...(layerConfig.subdomains && { subdomains: layerConfig.subdomains }),
    });
    newTileLayer.addTo(mapRef.current);
    currentLayerRef.current = newTileLayer;
  }, [satelliteView]);

  return <div ref={containerRef} id={id} className={className} />;
}

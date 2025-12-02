"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Trash2, Check, AlertTriangle } from "lucide-react";
import { SatelliteLayerControl, MapViewMode } from "@/components/maps/satellite-layer-control";
import { TILE_LAYERS } from "@/components/maps/leaflet-map";
import { AreaAnalysisLoader } from "@/components/maps/area-analysis-loader";
import { AreaAnalysisDisplay } from "@/components/maps/area-analysis-display";
import { useAreaAnalysis } from "@/hooks/use-area-analysis";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { calculatePolygonArea, isPolygonInBolivia } from "@/lib/geo/turf-utils";
import { toast } from "sonner";

interface ProjectMapDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (geometry: GeoJSON.Polygon) => void;
  initialGeometry?: GeoJSON.Polygon;
}

// Bolivia bounds
const BOLIVIA_CENTER: [number, number] = [-16.5, -64.5];
const BOLIVIA_BOUNDS: [[number, number], [number, number]] = [
  [-23, -70],
  [-10, -58],
];

export function ProjectMapDrawer({
  open,
  onOpenChange,
  onSave,
  initialGeometry,
}: ProjectMapDrawerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<GeoJSON.Polygon | null>(
    initialGeometry || null
  );
  const [areaHectares, setAreaHectares] = useState<number | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<MapViewMode>("street");

  // Area analysis hook
  const { analyze, isAnalyzing, progress, result, error: analysisError } = useAreaAnalysis({
    onSuccess: (result) => {
      toast.success(
        `Análisis completado: ${result.trees.average.toLocaleString("es-BO")} árboles estimados`
      );
    },
    onError: (error) => {
      toast.error(`Error en análisis: ${error.message}`);
    },
  });

  useEffect(() => {
    if (!open) return;

    // Wait for the sheet to be rendered
    const timeout = setTimeout(() => {
      const container = document.getElementById("map-container");
      if (!container || mapRef.current) return;

      // Initialize map
      const map = L.map(container, {
        center: BOLIVIA_CENTER,
        zoom: 6,
        maxBounds: BOLIVIA_BOUNDS,
        maxBoundsViscosity: 0.8,
      });

      mapRef.current = map;

      // Add initial tile layer (street view)
      const layerConfig = TILE_LAYERS.street;
      const tileLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        maxZoom: layerConfig.maxZoom,
      });
      tileLayer.addTo(map);
      currentTileLayerRef.current = tileLayer;

      // Initialize feature group for drawn items
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;

      // Add draw control
      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems,
        },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: "#22c55e",
              fillColor: "#22c55e",
              fillOpacity: 0.3,
            },
          },
          polyline: false,
          rectangle: {
            shapeOptions: {
              color: "#22c55e",
              fillColor: "#22c55e",
              fillOpacity: 0.3,
            },
          },
          circle: false,
          circlemarker: false,
          marker: false,
        },
      });
      map.addControl(drawControl);

      // Handle drawn shapes
      map.on(L.Draw.Event.CREATED, (e) => {
        const event = e as L.DrawEvents.Created;
        const layer = event.layer;
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);
        handleLayerCreated(layer);
      });

      map.on(L.Draw.Event.EDITED, (e) => {
        const event = e as L.DrawEvents.Edited;
        const layers = event.layers;
        layers.eachLayer((layer: L.Layer) => {
          handleLayerCreated(layer);
        });
      });

      map.on(L.Draw.Event.DELETED, () => {
        setCurrentPolygon(null);
        setAreaHectares(null);
        setIsValid(true);
        setValidationError(null);
      });

      // Load initial geometry if provided
      if (initialGeometry) {
        const geoJsonLayer = L.geoJSON(initialGeometry, {
          style: {
            color: "#22c55e",
            fillColor: "#22c55e",
            fillOpacity: 0.3,
          },
        });
        drawnItems.addLayer(geoJsonLayer);
        map.fitBounds(geoJsonLayer.getBounds());
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [open, initialGeometry, viewMode]);

  // Handle view mode changes dynamically
  useEffect(() => {
    if (!mapRef.current || !currentTileLayerRef.current) return;

    // Remove current tile layer
    mapRef.current.removeLayer(currentTileLayerRef.current);

    // Add new tile layer based on view mode
    const layerConfig = viewMode === "satellite" ? TILE_LAYERS.satellite : TILE_LAYERS.street;
    const tileOptions: L.TileLayerOptions = {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
    };

    // Only add subdomains if defined
    if (layerConfig.subdomains) {
      tileOptions.subdomains = layerConfig.subdomains;
    }

    const newTileLayer = L.tileLayer(layerConfig.url, tileOptions);
    newTileLayer.addTo(mapRef.current);
    currentTileLayerRef.current = newTileLayer;
  }, [viewMode]);

  const handleLayerCreated = async (layer: L.Layer) => {
    const geoJson = (layer as L.Polygon | L.Rectangle).toGeoJSON();
    const geometry = geoJson.geometry as GeoJSON.Polygon;

    // Validate polygon
    try {
      const inBolivia = isPolygonInBolivia(geometry);
      if (!inBolivia) {
        setIsValid(false);
        setValidationError(
          "El polígono debe estar dentro del territorio boliviano"
        );
        setCurrentPolygon(null);
        setAreaHectares(null);
        return;
      }

      // Calculate area
      const area = calculatePolygonArea(geometry);
      if (area < 1) {
        setIsValid(false);
        setValidationError("El área mínima debe ser de 1 hectárea");
        setCurrentPolygon(null);
        setAreaHectares(null);
        return;
      }

      setCurrentPolygon(geometry);
      setAreaHectares(area);
      setIsValid(true);
      setValidationError(null);

      // Automatically analyze the drawn area
      toast.info("Analizando área...");
      await analyze(geometry);
    } catch {
      setIsValid(false);
      setValidationError("Error al validar el polígono");
      setCurrentPolygon(null);
      setAreaHectares(null);
    }
  };

  const handleClear = () => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }
    setCurrentPolygon(null);
    setAreaHectares(null);
    setIsValid(true);
    setValidationError(null);
  };

  const handleSave = () => {
    if (currentPolygon && isValid) {
      onSave(currentPolygon);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Dibujar Área del Proyecto</SheetTitle>
          <SheetDescription>
            Usa las herramientas de dibujo para marcar el área del proyecto en
            el mapa
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 pb-6">
          {/* Area indicator */}
          {areaHectares && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-700" />
                <span className="font-medium text-green-900">Área calculada:</span>
              </div>
              <Badge variant="outline" className="text-lg">
                {areaHectares.toLocaleString("es-BO", {
                  maximumFractionDigits: 2,
                })}{" "}
                ha
              </Badge>
            </div>
          )}

          {/* Analysis Progress */}
          {isAnalyzing && progress && <AreaAnalysisLoader progress={progress} />}

          {/* Analysis Results */}
          {result && !isAnalyzing && <AreaAnalysisDisplay result={result} />}

          {/* Validation error */}
          {!isValid && validationError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Analysis error */}
          {analysisError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error en análisis: {analysisError.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Instrucciones:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Cambia entre vista Calles/Satélite según prefieras (botones abajo)</li>
                <li>Usa el botón de polígono para dibujar el área</li>
                <li>Haz clic en el mapa para agregar puntos</li>
                <li>Haz doble clic para finalizar el polígono</li>
                <li>Usa las herramientas de edición para ajustar</li>
                <li>El área debe estar dentro de Bolivia (mín. 1 ha)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Satellite Layer Control */}
          <div className="flex justify-end">
            <SatelliteLayerControl
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {/* Map container */}
          <div
            id="map-container"
            className="w-full h-[500px] border rounded-lg relative"
          />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={!currentPolygon}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!currentPolygon || !isValid}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Guardar Área
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

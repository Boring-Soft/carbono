import { useEffect, useState } from "react";
import L from "leaflet";

interface ForestBoundariesData {
  boundaries: GeoJSON.FeatureCollection;
  metadata: {
    totalRegions: number;
    totalForestAreaHectares: number;
    dataSource: string;
    threshold: number;
    lastUpdated: string;
  };
}

interface UseForestBoundariesOptions {
  map: L.Map | null;
  enabled?: boolean;
  style?: {
    color?: string;
    weight?: number;
    opacity?: number;
    fillOpacity?: number;
  };
}

/**
 * Hook to add forest boundaries layer to Leaflet map
 *
 * Fetches national forest boundaries from API and displays them
 * as thick black borders on the map.
 *
 * @param options - Configuration options
 * @returns Loading state, error, and layer reference
 */
export function useForestBoundaries({
  map,
  enabled = true,
  style = {
    color: "#000000",
    weight: 3,
    opacity: 1,
    fillOpacity: 0,
  },
}: UseForestBoundariesOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layer, setLayer] = useState<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!map || !enabled) return;

    let isMounted = true;
    let geoJsonLayer: L.GeoJSON | null = null;

    const loadBoundaries = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/national/forest-boundaries");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch forest boundaries");
        }

        if (!isMounted) return;

        const data: ForestBoundariesData = result.data;

        // Create GeoJSON layer with custom styling
        geoJsonLayer = L.geoJSON(data.boundaries, {
          style: () => ({
            color: style.color,
            weight: style.weight,
            opacity: style.opacity,
            fillOpacity: style.fillOpacity,
          }),
          onEachFeature: (feature, layer) => {
            // Add popup with forest region info
            if (feature.properties) {
              const popupContent = `
                <div style="min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">
                    ${feature.properties.name}
                  </h3>
                  <p style="margin: 4px 0; font-size: 13px;">
                    <strong>Región:</strong> ${feature.properties.region}
                  </p>
                  <p style="margin: 4px 0; font-size: 13px;">
                    <strong>Tipo:</strong> ${feature.properties.forestType}
                  </p>
                  <p style="margin: 4px 0; font-size: 13px;">
                    <strong>Área:</strong> ${(
                      feature.properties.areaHectares / 1000000
                    ).toFixed(2)} M ha
                  </p>
                  <p style="margin: 4px 0; font-size: 13px;">
                    <strong>Cobertura arbórea:</strong> ${feature.properties.treeCoverPercent}%
                  </p>
                </div>
              `;
              layer.bindPopup(popupContent);
            }

            // Add hover effect
            layer.on({
              mouseover: (e) => {
                const target = e.target;
                target.setStyle({
                  weight: (style.weight || 3) + 1,
                  color: "#FF0000",
                });
              },
              mouseout: (e) => {
                geoJsonLayer?.resetStyle(e.target);
              },
            });
          },
        });

        geoJsonLayer.addTo(map);
        setLayer(geoJsonLayer);
        setLoading(false);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      }
    };

    loadBoundaries();

    // Cleanup
    return () => {
      isMounted = false;
      if (geoJsonLayer && map) {
        map.removeLayer(geoJsonLayer);
      }
    };
  }, [map, enabled, style.color, style.weight, style.opacity, style.fillOpacity]);

  return { loading, error, layer };
}

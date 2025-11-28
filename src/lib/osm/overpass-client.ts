/**
 * OpenStreetMap Overpass API Client
 *
 * This client handles queries to the Overpass API to fetch geographical data
 * within specified polygon boundaries in Bolivia.
 *
 * API Documentation: https://wiki.openstreetmap.org/wiki/Overpass_API
 * Public endpoint: https://overpass-api.de/api/interpreter
 */

const OVERPASS_API_URL = process.env.OVERPASS_API_URL || "https://overpass-api.de/api/interpreter";
const DEFAULT_TIMEOUT = 60; // seconds

export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
  members?: Array<{
    type: string;
    ref: number;
    role: string;
  }>;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  osm3s: {
    timestamp_osm_base: string;
    copyright: string;
  };
  elements: OverpassElement[];
}

/**
 * Convert GeoJSON polygon to Overpass QL polygon filter
 */
function polygonToOverpassQL(geometry: GeoJSON.Polygon): string {
  const coordinates = geometry.coordinates[0];
  const points = coordinates.map(([lon, lat]) => `${lat} ${lon}`).join(" ");
  return `(poly:"${points}")`;
}

/**
 * Execute Overpass QL query
 */
async function executeQuery(query: string): Promise<OverpassResponse> {
  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Overpass API error: ${response.status} - ${text}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Overpass query error:", error);
    throw error;
  }
}

/**
 * Fetch waterways (rivers, streams) within polygon
 */
export async function fetchWaterways(geometry: GeoJSON.Polygon): Promise<OverpassElement[]> {
  const polyFilter = polygonToOverpassQL(geometry);

  const query = `
    [out:json][timeout:${DEFAULT_TIMEOUT}];
    (
      way["waterway"~"river|stream|canal"]${polyFilter};
      relation["waterway"~"river|stream"]${polyFilter};
    );
    out geom;
  `;

  const response = await executeQuery(query);
  return response.elements;
}

/**
 * Fetch buildings within polygon
 */
export async function fetchBuildings(geometry: GeoJSON.Polygon): Promise<OverpassElement[]> {
  const polyFilter = polygonToOverpassQL(geometry);

  const query = `
    [out:json][timeout:${DEFAULT_TIMEOUT}];
    (
      way["building"]${polyFilter};
      relation["building"]${polyFilter};
    );
    out geom;
  `;

  const response = await executeQuery(query);
  return response.elements;
}

/**
 * Fetch communities and settlements within polygon
 */
export async function fetchCommunities(geometry: GeoJSON.Polygon): Promise<OverpassElement[]> {
  const polyFilter = polygonToOverpassQL(geometry);

  const query = `
    [out:json][timeout:${DEFAULT_TIMEOUT}];
    (
      node["place"~"village|town|hamlet|isolated_dwelling"]${polyFilter};
      way["place"~"village|town|hamlet"]${polyFilter};
      relation["place"~"village|town"]${polyFilter};
    );
    out geom;
  `;

  const response = await executeQuery(query);
  return response.elements;
}

/**
 * Fetch natural tree nodes within polygon (for tree counting)
 * Note: This returns individual tree nodes tagged in OSM, not estimated tree count
 */
export async function fetchTrees(geometry: GeoJSON.Polygon): Promise<OverpassElement[]> {
  const polyFilter = polygonToOverpassQL(geometry);

  const query = `
    [out:json][timeout:${DEFAULT_TIMEOUT}];
    (
      node["natural"="tree"]${polyFilter};
      way["natural"="tree_row"]${polyFilter};
      way["landuse"="forest"]${polyFilter};
      way["landuse"="orchard"]${polyFilter};
    );
    out geom;
  `;

  const response = await executeQuery(query);
  return response.elements;
}

/**
 * Fetch all amenities (schools, health centers, etc.) within polygon
 */
export async function fetchAmenities(geometry: GeoJSON.Polygon): Promise<OverpassElement[]> {
  const polyFilter = polygonToOverpassQL(geometry);

  const query = `
    [out:json][timeout:${DEFAULT_TIMEOUT}];
    (
      node["amenity"~"school|hospital|clinic|community_centre"]${polyFilter};
      way["amenity"~"school|hospital|clinic|community_centre"]${polyFilter};
    );
    out geom;
  `;

  const response = await executeQuery(query);
  return response.elements;
}

/**
 * Get bounding box from polygon for validation
 */
export function getPolygonBBox(geometry: GeoJSON.Polygon): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  const coordinates = geometry.coordinates[0];
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  coordinates.forEach(([lon, lat]) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
  });

  return { minLat, maxLat, minLon, maxLon };
}

/**
 * Validate that polygon is within Bolivia bounds
 */
export function isPolygonInBoliviaBounds(geometry: GeoJSON.Polygon): boolean {
  const bbox = getPolygonBBox(geometry);

  // Bolivia approximate bounds
  const boliviaBounds = {
    minLat: -23,
    maxLat: -10,
    minLon: -70,
    maxLon: -58,
  };

  return (
    bbox.minLat >= boliviaBounds.minLat &&
    bbox.maxLat <= boliviaBounds.maxLat &&
    bbox.minLon >= boliviaBounds.minLon &&
    bbox.maxLon <= boliviaBounds.maxLon
  );
}

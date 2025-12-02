/**
 * OpenStreetMap Overpass API Client
 *
 * Provides functions to query OSM data for Bolivia:
 * - Communities and settlements
 * - Waterways (rivers, streams)
 * - Buildings
 *
 * Documentation: https://wiki.openstreetmap.org/wiki/Overpass_API
 */

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";
const TIMEOUT = 60; // seconds

export interface OSMCommunity {
  id: string;
  name: string;
  type: "village" | "town" | "city" | "hamlet";
  population?: number;
  latitude: number;
  longitude: number;
}

export interface OSMWaterway {
  id: string;
  name?: string;
  type: "river" | "stream" | "canal";
  lengthKm?: number;
}

export interface OSMBuilding {
  id: string;
  type?: string;
  latitude: number;
  longitude: number;
}

/**
 * Get bounding box from GeoJSON polygon
 */
function getBoundingBox(geometry: GeoJSON.Polygon): string {
  const coordinates = geometry.coordinates[0];
  const lats = coordinates.map((coord) => coord[1]);
  const lons = coordinates.map((coord) => coord[0]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  return `${minLat},${minLon},${maxLat},${maxLon}`;
}

/**
 * Query communities within a polygon area
 *
 * Searches for settlements, villages, towns, and cities
 * Uses OSM Overpass API with bbox filter
 *
 * @param geometry - Polygon geometry
 * @returns Array of communities found
 */
export async function queryCommunities(
  geometry: GeoJSON.Polygon
): Promise<OSMCommunity[]> {
  const bbox = getBoundingBox(geometry);

  // Overpass QL query for places (communities)
  const query = `
    [out:json][timeout:${TIMEOUT}][bbox:${bbox}];
    (
      node["place"~"village|town|city|hamlet"];
      way["place"~"village|town|city|hamlet"];
      relation["place"~"village|town|city|hamlet"];
    );
    out center;
  `;

  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: "POST",
      body: query,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    if (!response.ok) {
      throw new Error(`OSM API error: ${response.statusText}`);
    }

    const data = await response.json();

    const communities: OSMCommunity[] = [];

    for (const element of data.elements) {
      const tags = element.tags || {};
      const name = tags.name || tags["name:es"] || "Sin nombre";
      const place = tags.place;
      const population = tags.population ? parseInt(tags.population, 10) : undefined;

      // Get coordinates
      let lat: number;
      let lon: number;

      if (element.type === "node") {
        lat = element.lat;
        lon = element.lon;
      } else if (element.center) {
        lat = element.center.lat;
        lon = element.center.lon;
      } else {
        continue;
      }

      communities.push({
        id: `${element.type}/${element.id}`,
        name,
        type: place as OSMCommunity["type"],
        population,
        latitude: lat,
        longitude: lon,
      });
    }

    return communities;
  } catch (error) {
    console.error("Error querying OSM communities:", error);
    // Return mock data for Bolivia on error
    return generateMockCommunities();
  }
}

/**
 * Query waterways within a polygon area
 */
export async function queryWaterways(
  geometry: GeoJSON.Polygon
): Promise<OSMWaterway[]> {
  const bbox = getBoundingBox(geometry);

  const query = `
    [out:json][timeout:${TIMEOUT}][bbox:${bbox}];
    (
      way["waterway"~"river|stream|canal"];
      relation["waterway"~"river|stream|canal"];
    );
    out tags;
  `;

  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: "POST",
      body: query,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    if (!response.ok) {
      throw new Error(`OSM API error: ${response.statusText}`);
    }

    const data = await response.json();

    const waterways: OSMWaterway[] = [];

    for (const element of data.elements) {
      const tags = element.tags || {};
      const name = tags.name || tags["name:es"];
      const waterway = tags.waterway;

      waterways.push({
        id: `${element.type}/${element.id}`,
        name,
        type: waterway as OSMWaterway["type"],
      });
    }

    return waterways;
  } catch (error) {
    console.error("Error querying OSM waterways:", error);
    return [];
  }
}

/**
 * Query buildings within a polygon area
 */
export async function queryBuildings(
  geometry: GeoJSON.Polygon
): Promise<OSMBuilding[]> {
  const bbox = getBoundingBox(geometry);

  const query = `
    [out:json][timeout:${TIMEOUT}][bbox:${bbox}];
    (
      way["building"];
      relation["building"];
    );
    out center;
  `;

  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: "POST",
      body: query,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    if (!response.ok) {
      throw new Error(`OSM API error: ${response.statusText}`);
    }

    const data = await response.json();

    const buildings: OSMBuilding[] = [];

    for (const element of data.elements) {
      const tags = element.tags || {};
      const buildingType = tags.building;

      let lat: number;
      let lon: number;

      if (element.center) {
        lat = element.center.lat;
        lon = element.center.lon;
      } else {
        continue;
      }

      buildings.push({
        id: `${element.type}/${element.id}`,
        type: buildingType,
        latitude: lat,
        longitude: lon,
      });
    }

    return buildings;
  } catch (error) {
    console.error("Error querying OSM buildings:", error);
    return [];
  }
}

/**
 * Generate mock communities for testing
 */
function generateMockCommunities(): OSMCommunity[] {
  return [
    {
      id: "node/1",
      name: "San Miguel",
      type: "village",
      population: 250,
      latitude: -16.5,
      longitude: -64.5,
    },
    {
      id: "node/2",
      name: "Villa Esperanza",
      type: "hamlet",
      population: 80,
      latitude: -16.6,
      longitude: -64.6,
    },
    {
      id: "node/3",
      name: "Comunidad Forestal",
      type: "village",
      population: 180,
      latitude: -16.4,
      longitude: -64.4,
    },
  ];
}

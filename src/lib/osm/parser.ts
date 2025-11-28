/**
 * OSM Data Parser
 *
 * Utilities to parse and extract useful information from Overpass API responses
 */

import { OverpassElement } from "./overpass-client";

export interface WaterwayData {
  totalRivers: number;
  totalStreams: number;
  totalCanals: number;
  rivers: Array<{
    id: number;
    name: string | null;
    type: string;
    lengthKm?: number;
  }>;
  estimatedLengthKm: number;
}

export interface BuildingData {
  totalBuildings: number;
  residential: number;
  commercial: number;
  public: number;
  other: number;
  buildings: Array<{
    id: number;
    type: string;
    buildingType?: string;
    name?: string;
  }>;
}

export interface CommunityData {
  totalCommunities: number;
  villages: number;
  towns: number;
  hamlets: number;
  communities: Array<{
    id: number;
    name: string | null;
    type: string;
    population?: number;
  }>;
  estimatedPopulation: number;
}

export interface TreeData {
  individualTrees: number;
  treeRows: number;
  forestAreas: number;
  orchards: number;
  estimatedTotalTrees: number;
}

/**
 * Parse waterway elements from OSM
 */
export function parseWaterways(elements: OverpassElement[]): WaterwayData {
  const rivers: WaterwayData["rivers"] = [];
  let totalRivers = 0;
  let totalStreams = 0;
  let totalCanals = 0;
  let estimatedLengthKm = 0;

  elements.forEach((element) => {
    const waterwayType = element.tags?.waterway;
    const name = element.tags?.name || null;

    // Estimate length from geometry if available
    let lengthKm: number | undefined;
    if (element.geometry && element.geometry.length > 1) {
      lengthKm = estimateLineLength(element.geometry);
    }

    if (waterwayType === "river") {
      totalRivers++;
      rivers.push({ id: element.id, name, type: "river", lengthKm });
      if (lengthKm) estimatedLengthKm += lengthKm;
    } else if (waterwayType === "stream") {
      totalStreams++;
      rivers.push({ id: element.id, name, type: "stream", lengthKm });
      if (lengthKm) estimatedLengthKm += lengthKm;
    } else if (waterwayType === "canal") {
      totalCanals++;
      rivers.push({ id: element.id, name, type: "canal", lengthKm });
      if (lengthKm) estimatedLengthKm += lengthKm;
    }
  });

  return {
    totalRivers,
    totalStreams,
    totalCanals,
    rivers,
    estimatedLengthKm: Math.round(estimatedLengthKm * 10) / 10,
  };
}

/**
 * Parse building elements from OSM
 */
export function parseBuildings(elements: OverpassElement[]): BuildingData {
  const buildings: BuildingData["buildings"] = [];
  let residential = 0;
  let commercial = 0;
  let publicBuildings = 0;
  let other = 0;

  elements.forEach((element) => {
    const buildingTag = element.tags?.building;
    const buildingType = element.tags?.["building:type"] || buildingTag;
    const name = element.tags?.name;

    buildings.push({
      id: element.id,
      type: element.type,
      buildingType,
      name,
    });

    // Categorize buildings
    if (
      buildingType === "house" ||
      buildingType === "residential" ||
      buildingType === "apartments" ||
      buildingType === "dwelling"
    ) {
      residential++;
    } else if (
      buildingType === "commercial" ||
      buildingType === "retail" ||
      buildingType === "shop"
    ) {
      commercial++;
    } else if (
      buildingType === "school" ||
      buildingType === "hospital" ||
      buildingType === "public" ||
      buildingType === "government"
    ) {
      publicBuildings++;
    } else {
      other++;
    }
  });

  return {
    totalBuildings: elements.length,
    residential,
    commercial,
    public: publicBuildings,
    other,
    buildings,
  };
}

/**
 * Parse community/settlement elements from OSM
 */
export function parseCommunities(elements: OverpassElement[]): CommunityData {
  const communities: CommunityData["communities"] = [];
  let villages = 0;
  let towns = 0;
  let hamlets = 0;
  let estimatedPopulation = 0;

  elements.forEach((element) => {
    const placeType = element.tags?.place;
    const name = element.tags?.name || null;
    const populationStr = element.tags?.population;
    const population = populationStr ? parseInt(populationStr, 10) : undefined;

    communities.push({
      id: element.id,
      name,
      type: placeType || "unknown",
      population,
    });

    // Categorize and estimate population if not provided
    if (placeType === "village") {
      villages++;
      estimatedPopulation += population || 500; // Average village
    } else if (placeType === "town") {
      towns++;
      estimatedPopulation += population || 5000; // Average town
    } else if (placeType === "hamlet") {
      hamlets++;
      estimatedPopulation += population || 100; // Average hamlet
    } else {
      estimatedPopulation += population || 200; // Default estimate
    }
  });

  return {
    totalCommunities: elements.length,
    villages,
    towns,
    hamlets,
    communities,
    estimatedPopulation,
  };
}

/**
 * Parse tree elements from OSM
 */
export function parseTrees(elements: OverpassElement[]): TreeData {
  let individualTrees = 0;
  let treeRows = 0;
  let forestAreas = 0;
  let orchards = 0;
  let estimatedTotalTrees = 0;

  elements.forEach((element) => {
    const naturalTag = element.tags?.natural;
    const landuseTag = element.tags?.landuse;

    if (naturalTag === "tree") {
      individualTrees++;
      estimatedTotalTrees++;
    } else if (naturalTag === "tree_row") {
      treeRows++;
      // Estimate 20-50 trees per tree row
      estimatedTotalTrees += 35;
    } else if (landuseTag === "forest") {
      forestAreas++;
      // Estimate based on area if geometry available
      if (element.geometry && element.geometry.length > 2) {
        const areaHa = estimatePolygonArea(element.geometry);
        // Assume ~400 trees per hectare for forest
        estimatedTotalTrees += Math.round(areaHa * 400);
      } else {
        estimatedTotalTrees += 1000; // Default estimate
      }
    } else if (landuseTag === "orchard") {
      orchards++;
      if (element.geometry && element.geometry.length > 2) {
        const areaHa = estimatePolygonArea(element.geometry);
        // Orchards typically have ~100-200 trees per hectare
        estimatedTotalTrees += Math.round(areaHa * 150);
      } else {
        estimatedTotalTrees += 500; // Default estimate
      }
    }
  });

  return {
    individualTrees,
    treeRows,
    forestAreas,
    orchards,
    estimatedTotalTrees,
  };
}

/**
 * Estimate line length in kilometers from geometry points
 * Using Haversine formula for spherical distance
 */
function estimateLineLength(geometry: Array<{ lat: number; lon: number }>): number {
  let totalKm = 0;

  for (let i = 0; i < geometry.length - 1; i++) {
    const point1 = geometry[i];
    const point2 = geometry[i + 1];
    totalKm += haversineDistance(point1.lat, point1.lon, point2.lat, point2.lon);
  }

  return totalKm;
}

/**
 * Estimate polygon area in hectares from geometry points
 */
function estimatePolygonArea(geometry: Array<{ lat: number; lon: number }>): number {
  // Simple estimation using shoelace formula
  // This is approximate - for accurate calculations use turf.js
  let area = 0;
  const n = geometry.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += geometry[i].lon * geometry[j].lat;
    area -= geometry[j].lon * geometry[i].lat;
  }

  area = Math.abs(area) / 2.0;

  // Convert from square degrees to hectares (very rough approximation)
  // 1 degree latitude ≈ 111 km, 1 degree longitude ≈ 111 km * cos(latitude)
  const avgLat = geometry.reduce((sum, p) => sum + p.lat, 0) / n;
  const latKm = 111;
  const lonKm = 111 * Math.cos((avgLat * Math.PI) / 180);

  const areaKm2 = area * latKm * lonKm;
  const areaHectares = areaKm2 * 100; // 1 km² = 100 hectares

  return areaHectares;
}

/**
 * Haversine distance formula
 * Returns distance in kilometers between two lat/lon points
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

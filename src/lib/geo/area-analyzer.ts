/**
 * Area Analyzer Orchestrator
 *
 * Coordinates multiple analysis operations in parallel:
 * - Forest coverage analysis (GEE or estimation)
 * - OSM elements (waterways, buildings, communities)
 * - Tree estimation (hybrid OSM + GEE)
 */

import { calculatePolygonArea } from "./turf-utils";
import {
  fetchWaterways,
  fetchBuildings,
  fetchCommunities,
  fetchTrees,
  isPolygonInBoliviaBounds,
} from "../osm/overpass-client";
import {
  parseWaterways,
  parseBuildings,
  parseCommunities,
  parseTrees,
  type WaterwayData,
  type BuildingData,
  type CommunityData,
  type TreeData,
} from "../osm/parser";
import type {
  AreaAnalysisResult,
  ForestMetrics,
  TreeEstimation,
} from "@/types/analysis";

// Carbon calculation constants
const AVERAGE_BIOMASS_TONS_PER_HECTARE = 200;
const CARBON_FRACTION = 0.47;
const CO2_CONVERSION_FACTOR = 3.67;
const ANNUAL_GROWTH_RATE = 0.02;

interface AnalyzeAreaOptions {
  includeOSM?: boolean;
  includeForest?: boolean;
  includeTrees?: boolean;
  timeout?: number;
}

/**
 * Main orchestrator function - runs all analyses in parallel
 */
export async function analyzeArea(
  geometry: GeoJSON.Polygon,
  options: AnalyzeAreaOptions = {}
): Promise<AreaAnalysisResult> {
  const startTime = Date.now();

  // Validate geometry
  if (!isPolygonInBoliviaBounds(geometry)) {
    throw new Error("Polygon must be within Bolivia bounds");
  }

  const areaHectares = calculatePolygonArea(geometry);

  // Validate area size (max 100,000 ha = 1,000 km²)
  if (areaHectares > 100000) {
    throw new Error("Area too large. Maximum allowed is 100,000 hectares");
  }

  if (areaHectares < 1) {
    throw new Error("Area too small. Minimum area is 1 hectare");
  }

  const {
    includeOSM = true,
    includeForest = true,
    includeTrees = true,
  } = options;

  // Run analyses in parallel using Promise.allSettled
  const [forestResult, osmResult] = await Promise.allSettled([
    // Forest analysis
    includeForest ? analyzeForest(geometry, areaHectares) : Promise.resolve(null),

    // OSM analysis (waterways, buildings, communities, trees)
    includeOSM
      ? Promise.all([
          fetchWaterways(geometry).catch(() => []),
          fetchBuildings(geometry).catch(() => []),
          fetchCommunities(geometry).catch(() => []),
          includeTrees ? fetchTrees(geometry).catch(() => []) : Promise.resolve([]),
        ])
      : Promise.resolve([[], [], [], []]),
  ]);

  // Process forest results
  const forest: ForestMetrics =
    forestResult.status === "fulfilled" && forestResult.value
      ? forestResult.value
      : getDefaultForestMetrics(areaHectares);

  // Process OSM results
  let waterways: WaterwayData;
  let buildings: BuildingData;
  let communities: CommunityData;
  let trees: TreeEstimation;

  if (osmResult.status === "fulfilled" && osmResult.value) {
    const [waterwayElements, buildingElements, communityElements, treeElements] =
      osmResult.value;

    // Parse OSM data
    const waterwaysParsed = parseWaterways(waterwayElements);
    const buildingsParsed = parseBuildings(buildingElements);
    const communitiesParsed = parseCommunities(communityElements);
    const treesParsed = parseTrees(treeElements);

    // Convert to analysis format
    waterways = {
      total: waterwaysParsed.totalRivers + waterwaysParsed.totalStreams + waterwaysParsed.totalCanals,
      rivers: waterwaysParsed.totalRivers,
      streams: waterwaysParsed.totalStreams,
      canals: waterwaysParsed.totalCanals,
      list: waterwaysParsed.rivers.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type as "river" | "stream" | "canal",
        lengthKm: r.lengthKm,
      })),
      totalLengthKm: waterwaysParsed.estimatedLengthKm,
      majorWaterways: waterwaysParsed.rivers.filter((r) => r.name),
    };

    buildings = {
      total: buildingsParsed.totalBuildings,
      residential: buildingsParsed.residential,
      commercial: buildingsParsed.commercial,
      public: buildingsParsed.public,
      other: buildingsParsed.other,
      list: buildingsParsed.buildings.map((b) => ({
        ...b,
        category: categorizeBu ilding(b.buildingType),
      })),
      density: buildingsParsed.totalBuildings / areaHectares,
    };

    communities = {
      total: communitiesParsed.totalCommunities,
      villages: communitiesParsed.villages,
      towns: communitiesParsed.towns,
      hamlets: communitiesParsed.hamlets,
      list: communitiesParsed.communities.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type as any,
        population: c.population,
        estimatedPopulation: c.population || getEstimatedPopulation(c.type),
      })),
      totalPopulation: communitiesParsed.communities
        .filter((c) => c.population)
        .reduce((sum, c) => sum + (c.population || 0), 0),
      estimatedPopulation: communitiesParsed.estimatedPopulation,
    };

    trees = {
      min: Math.round(treesParsed.estimatedTotalTrees * 0.7),
      max: Math.round(treesParsed.estimatedTotalTrees * 1.3),
      estimate: treesParsed.estimatedTotalTrees,
      confidence: getTreeConfidence(treesParsed),
      method: "osm",
      details: {
        individualTrees: treesParsed.individualTrees,
        treeRows: treesParsed.treeRows,
        forestAreas: treesParsed.forestAreas,
        orchards: treesParsed.orchards,
      },
    };
  } else {
    // Default values if OSM failed
    waterways = getDefaultWaterways();
    buildings = getDefaultBuildings();
    communities = getDefaultCommunities();
    trees = getDefaultTrees(areaHectares);
  }

  const endTime = Date.now();
  const processingTimeSeconds = Math.round((endTime - startTime) / 1000);

  // Build final result
  const result: AreaAnalysisResult = {
    areaHectares,
    analyzedAt: new Date(),
    processingTimeSeconds,
    forest,
    trees,
    waterways,
    buildings,
    communities,
    summary: {
      isForested: forest.forestCoveragePercent > 50,
      isPpopulated: communities.total > 0 || buildings.total > 10,
      hasWaterAccess: waterways.total > 0,
      conservationPriority: calculateConservationPriority(forest, communities, buildings),
    },
  };

  return result;
}

/**
 * Analyze forest coverage and carbon metrics
 * TODO: Integrate with real Google Earth Engine
 */
async function analyzeForest(
  geometry: GeoJSON.Polygon,
  areaHectares: number
): Promise<ForestMetrics> {
  // Simulate async GEE call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock data for now
  const forestCoveragePercent = Math.random() * 40 + 60; // 60-100%
  const forestAreaHectares = (areaHectares * forestCoveragePercent) / 100;
  const biomass = forestAreaHectares * AVERAGE_BIOMASS_TONS_PER_HECTARE;
  const carbonStock = biomass * CARBON_FRACTION;
  const estimatedCo2TonsYear = carbonStock * ANNUAL_GROWTH_RATE * CO2_CONVERSION_FACTOR;

  return {
    totalAreaHectares: areaHectares,
    forestAreaHectares,
    forestCoveragePercent,
    biomass,
    carbonStock,
    estimatedCo2TonsYear,
    treeCoverDensity: forestCoveragePercent,
    forestType: "tropical",
  };
}

// Helper functions
function getDefaultForestMetrics(areaHectares: number): ForestMetrics {
  return {
    totalAreaHectares: areaHectares,
    forestAreaHectares: 0,
    forestCoveragePercent: 0,
    biomass: 0,
    carbonStock: 0,
    estimatedCo2TonsYear: 0,
  };
}

function getDefaultWaterways(): any {
  return {
    total: 0,
    rivers: 0,
    streams: 0,
    canals: 0,
    list: [],
    totalLengthKm: 0,
    majorWaterways: [],
  };
}

function getDefaultBuildings(): any {
  return {
    total: 0,
    residential: 0,
    commercial: 0,
    public: 0,
    other: 0,
    list: [],
    density: 0,
  };
}

function getDefaultCommunities(): any {
  return {
    total: 0,
    villages: 0,
    towns: 0,
    hamlets: 0,
    list: [],
    totalPopulation: 0,
    estimatedPopulation: 0,
  };
}

function getDefaultTrees(areaHectares: number): TreeEstimation {
  const estimate = Math.round(areaHectares * 400 * 0.5); // Conservative estimate
  return {
    min: Math.round(estimate * 0.5),
    max: Math.round(estimate * 1.5),
    estimate,
    confidence: "low",
    method: "hybrid",
    details: {
      individualTrees: 0,
      treeRows: 0,
      forestAreas: 0,
      orchards: 0,
    },
  };
}

function categorizeBuilding(
  buildingType?: string
): "residential" | "commercial" | "public" | "other" {
  if (!buildingType) return "other";

  if (
    ["house", "residential", "apartments", "dwelling"].includes(buildingType)
  ) {
    return "residential";
  }
  if (["commercial", "retail", "shop"].includes(buildingType)) {
    return "commercial";
  }
  if (["school", "hospital", "public", "government"].includes(buildingType)) {
    return "public";
  }
  return "other";
}

function getEstimatedPopulation(placeType: string): number {
  switch (placeType) {
    case "town":
      return 5000;
    case "village":
      return 500;
    case "hamlet":
      return 100;
    case "isolated_dwelling":
      return 10;
    default:
      return 200;
  }
}

function getTreeConfidence(treeData: TreeData): "low" | "medium" | "high" {
  const totalDataPoints =
    treeData.individualTrees +
    treeData.treeRows +
    treeData.forestAreas +
    treeData.orchards;

  if (totalDataPoints > 50) return "high";
  if (totalDataPoints > 10) return "medium";
  return "low";
}

function calculateConservationPriority(
  forest: ForestMetrics,
  communities: any,
  buildings: any
): "low" | "medium" | "high" {
  // High priority: High forest coverage + low population
  if (forest.forestCoveragePercent > 70 && communities.total < 3) {
    return "high";
  }

  // Medium priority: Moderate forest or moderate population
  if (forest.forestCoveragePercent > 40 || (communities.total < 5 && buildings.total < 50)) {
    return "medium";
  }

  return "low";
}

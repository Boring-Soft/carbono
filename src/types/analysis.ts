/**
 * Comprehensive types for area analysis system
 */

// Tree Estimation Types
export interface TreeEstimation {
  min: number;
  max: number;
  estimate: number;
  confidence: "low" | "medium" | "high";
  method: "osm" | "gee" | "hybrid";
  details: {
    individualTrees: number;
    treeRows: number;
    forestAreas: number;
    orchards: number;
    treeCoverDensity?: number; // 0-100%
  };
}

// Waterway Data Types
export interface WaterwayInfo {
  id: number;
  name: string | null;
  type: "river" | "stream" | "canal";
  lengthKm?: number;
}

export interface WaterwayData {
  total: number;
  rivers: number;
  streams: number;
  canals: number;
  list: WaterwayInfo[];
  totalLengthKm: number;
  majorWaterways: WaterwayInfo[]; // Named waterways only
}

// Building Data Types
export interface BuildingInfo {
  id: number;
  type: string;
  buildingType?: string;
  name?: string;
  category: "residential" | "commercial" | "public" | "other";
}

export interface BuildingData {
  total: number;
  residential: number;
  commercial: number;
  public: number;
  other: number;
  list: BuildingInfo[];
  density: number; // buildings per km²
}

// Community Data Types
export interface CommunityInfo {
  id: number;
  name: string | null;
  type: "village" | "town" | "hamlet" | "isolated_dwelling" | "other";
  population?: number;
  estimatedPopulation: number;
}

export interface CommunityData {
  total: number;
  villages: number;
  towns: number;
  hamlets: number;
  list: CommunityInfo[];
  totalPopulation: number;
  estimatedPopulation: number;
}

// Forest Analysis Types
export interface ForestMetrics {
  totalAreaHectares: number;
  forestAreaHectares: number;
  forestCoveragePercent: number;
  biomass: number; // tons
  carbonStock: number; // tons of carbon
  estimatedCo2TonsYear: number; // annual sequestration
  treeCoverDensity?: number; // 0-100%
  forestType?: "tropical" | "subtropical" | "temperate" | "mixed";
}

// Complete Area Analysis Result
export interface AreaAnalysisResult {
  // Basic info
  areaHectares: number;
  analyzedAt: Date;
  processingTimeSeconds: number;

  // Forest analysis
  forest: ForestMetrics;

  // OSM elements
  trees: TreeEstimation;
  waterways: WaterwayData;
  buildings: BuildingData;
  communities: CommunityData;

  // Summary stats
  summary: {
    isForested: boolean;
    isPpopulated: boolean;
    hasWaterAccess: boolean;
    conservationPriority: "low" | "medium" | "high";
  };
}

// API Request/Response types
export interface AnalyzeAreaRequest {
  geometry: GeoJSON.Polygon;
  options?: {
    includeOSM?: boolean;
    includeForest?: boolean;
    includeTrees?: boolean;
    timeout?: number; // seconds
  };
}

export interface AnalyzeAreaResponse {
  success: boolean;
  data?: AreaAnalysisResult;
  error?: string;
  cached?: boolean;
}

// Analysis Progress Types (for real-time updates)
export interface AnalysisProgress {
  stage: "connecting" | "forest" | "osm" | "trees" | "calculating" | "complete" | "error";
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number;
}

// Error types
export interface AnalysisError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

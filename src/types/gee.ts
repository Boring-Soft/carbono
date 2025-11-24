/**
 * Google Earth Engine Types
 * Types for interacting with GEE API and processing satellite data
 */

export interface GEEAreaAnalysisInput {
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  projectId?: string;
}

export interface GEEAreaAnalysisOutput {
  forestCoveragePercent: number;
  biomassPerHectare: number; // tC/ha (tons of carbon per hectare)
  forestType: ForestType;
  lastChangeDetected: Date | null;
  changePercent: number; // Percentage of forest cover lost
  verified: boolean;
  analysisDate: Date;
  dataSource: string;
  confidence: number; // 0-100
}

export enum ForestType {
  AMAZONIA = 'AMAZONIA',
  CHIQUITANIA = 'CHIQUITANIA',
  YUNGAS = 'YUNGAS',
  ALTIPLANO = 'ALTIPLANO',
  MIXED = 'MIXED',
  UNKNOWN = 'UNKNOWN'
}

export interface GEEHistoricalTrendsInput {
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  startDate: Date;
  endDate: Date;
}

export interface GEEHistoricalTrendsOutput {
  ndviTimeSeries: NDVIDataPoint[];
  forestCoverTimeSeries: ForestCoverDataPoint[];
  deforestationEvents: DeforestationEvent[];
}

export interface NDVIDataPoint {
  date: Date;
  ndvi: number; // Normalized Difference Vegetation Index (0-1)
  quality: number; // Quality score (0-100)
}

export interface ForestCoverDataPoint {
  date: Date;
  coveragePercent: number;
  areaHectares: number;
}

export interface DeforestationEvent {
  date: Date;
  areaLostHectares: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
}

// GEE Dataset configurations
export interface GEEDataset {
  id: string;
  name: string;
  description: string;
  resolution: number; // meters
  temporalResolution: string; // e.g., "daily", "16-day", "annual"
  bands: string[];
}

// GEE Request/Response types
export interface GEEAuthConfig {
  serviceAccountEmail: string;
  privateKey: string;
}

export interface GEEComputeRequest {
  expression: string;
  geometry: GeoJSON.Geometry;
  scale?: number;
  crs?: string;
}

export interface GEEComputeResponse {
  result: unknown;
  metadata: {
    computeTime: number;
    pixelCount: number;
  };
}

/**
 * Tree Estimation Module
 *
 * Estimates the number of trees in a forest area based on:
 * - Area size (hectares)
 * - Forest cover density (%)
 * - Forest type (tropical, dry, cloud forest)
 *
 * References:
 * - FAO Forest Resources Assessment 2020
 * - Bolivia National Forest Inventory
 * - Tropical forest density studies
 */

export type ForestDensityLevel = "low" | "medium" | "high" | "very_high";

export interface TreeEstimation {
  minTrees: number;
  maxTrees: number;
  averageTrees: number;
  confidence: number; // 0-100%
  densityLevel: ForestDensityLevel;
  treesPerHectare: number;
}

/**
 * Tree density factors by forest type (trees per hectare)
 *
 * Based on Bolivia forest types:
 * - Amazonian tropical forest: 400-600 trees/ha
 * - Dry Chiquitano forest: 200-350 trees/ha
 * - Yungas cloud forest: 300-500 trees/ha
 * - Chaco dry forest: 150-250 trees/ha
 */
const TREE_DENSITY_FACTORS = {
  low: { min: 150, max: 250, confidence: 60 }, // <30% cover
  medium: { min: 250, max: 400, confidence: 75 }, // 30-60% cover
  high: { min: 400, max: 600, confidence: 85 }, // 60-80% cover
  very_high: { min: 500, max: 700, confidence: 90 }, // >80% cover
};

/**
 * Get density level from forest cover percentage
 */
function getDensityLevel(forestCoverPercent: number): ForestDensityLevel {
  if (forestCoverPercent < 30) return "low";
  if (forestCoverPercent < 60) return "medium";
  if (forestCoverPercent < 80) return "high";
  return "very_high";
}

/**
 * Estimate number of trees in a forest area
 *
 * @param areaHectares - Total area in hectares
 * @param forestCoverPercent - Forest coverage percentage (0-100)
 * @returns Tree estimation with min/max/average and confidence
 */
export function estimateTrees(
  areaHectares: number,
  forestCoverPercent: number = 70
): TreeEstimation {
  // Determine density level
  const densityLevel = getDensityLevel(forestCoverPercent);
  const densityFactors = TREE_DENSITY_FACTORS[densityLevel];

  // Calculate forest area (only the forested portion)
  const forestAreaHectares = (areaHectares * forestCoverPercent) / 100;

  // Calculate tree counts
  const minTrees = Math.round(forestAreaHectares * densityFactors.min);
  const maxTrees = Math.round(forestAreaHectares * densityFactors.max);
  const averageTrees = Math.round((minTrees + maxTrees) / 2);
  const treesPerHectare = Math.round(
    (densityFactors.min + densityFactors.max) / 2
  );

  return {
    minTrees,
    maxTrees,
    averageTrees,
    confidence: densityFactors.confidence,
    densityLevel,
    treesPerHectare,
  };
}

/**
 * Estimate trees with mock forest coverage
 * Uses a default forest coverage of 70% for Bolivia forest areas
 */
export function estimateTreesSimple(areaHectares: number): TreeEstimation {
  // Assume medium-high forest coverage for Bolivia
  const defaultCoverage = 65 + Math.random() * 20; // 65-85%
  return estimateTrees(areaHectares, defaultCoverage);
}

/**
 * Format tree count for display
 */
export function formatTreeCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toLocaleString("es-BO");
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(confidence: number): {
  label: string;
  color: string;
} {
  if (confidence >= 85) {
    return { label: "Alta", color: "green" };
  }
  if (confidence >= 70) {
    return { label: "Media", color: "yellow" };
  }
  return { label: "Baja", color: "red" };
}

/**
 * Get density level description in Spanish
 */
export function getDensityDescription(level: ForestDensityLevel): string {
  const descriptions: Record<ForestDensityLevel, string> = {
    low: "Baja densidad",
    medium: "Densidad media",
    high: "Alta densidad",
    very_high: "Muy alta densidad",
  };
  return descriptions[level];
}

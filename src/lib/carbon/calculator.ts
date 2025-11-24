/**
 * Carbon Calculation Engine
 * Calculates CO₂ sequestration based on IPCC factors and project characteristics
 * Formula: CO₂ = Area (ha) × Biomass (tC/ha) × Conversion Factor × Project Factor
 */

import { ProjectType } from '@prisma/client';
import { ForestType as GEEForestType } from '@/types/gee';
import { CarbonCalculationInput, CarbonCalculationOutput, CarbonRevenueEstimate } from '@/types/carbon';
import {
  IPCC_FACTORS,
  PROJECT_FACTORS,
  getIPCCFactorByDepartment,
  ForestType as LocalForestType
} from './ipcc-factors';
import { CARBON_MARKET_PRICES } from './market-prices';

/**
 * CO₂ to Carbon conversion constant
 * 1 ton of carbon = 3.67 tons of CO₂ (molecular weight ratio: 44/12)
 */
const CARBON_TO_CO2_RATIO = 3.67;

/**
 * Map GEE forest types to local forest types
 */
function mapGEEForestTypeToLocal(geeType: GEEForestType): LocalForestType {
  const mapping: Record<GEEForestType, LocalForestType> = {
    [GEEForestType.AMAZONIA]: 'amazon',
    [GEEForestType.CHIQUITANIA]: 'chiquitania',
    [GEEForestType.YUNGAS]: 'yungas',
    [GEEForestType.ALTIPLANO]: 'altiplano',
    [GEEForestType.MIXED]: 'yungas', // Default to yungas for mixed
    [GEEForestType.UNKNOWN]: 'yungas', // Default to yungas for unknown
  };

  return mapping[geeType] || 'yungas';
}

/**
 * Map Prisma ProjectType to PROJECT_FACTORS keys
 */
function mapProjectTypeToFactorKey(projectType: ProjectType): keyof typeof PROJECT_FACTORS {
  const mapping: Record<ProjectType, keyof typeof PROJECT_FACTORS> = {
    [ProjectType.REDD_PLUS]: 'REDD_PLUS',
    [ProjectType.REFORESTATION]: 'REFORESTATION',
    [ProjectType.RENEWABLE_ENERGY]: 'RENEWABLE_ENERGY',
    [ProjectType.REGENERATIVE_AGRICULTURE]: 'REGENERATIVE_AGRICULTURE',
    [ProjectType.COMMUNITY_CONSERVATION]: 'COMMUNITY_CONSERVATION',
  };

  return mapping[projectType];
}

/**
 * Calculate carbon capture for a project
 *
 * @param input - Carbon calculation parameters
 * @returns Detailed carbon calculation output with revenue estimates
 */
export function calculateCarbonCapture(
  input: CarbonCalculationInput
): CarbonCalculationOutput {
  const { areaHectares, projectType, forestType, biomassPerHectare, durationYears } = input;

  // 1. Determine biomass per hectare
  let biomass: number;
  let biomassSource: string;

  if (biomassPerHectare && biomassPerHectare > 0) {
    // Use GEE-provided biomass (already in tC/ha)
    biomass = biomassPerHectare;
    biomassSource = 'GEE NASA Biomass Dataset';
  } else {
    // Use IPCC factors as fallback
    const localForestType = mapGEEForestTypeToLocal(forestType);
    const ipccFactor = IPCC_FACTORS[localForestType];

    // IPCC factors are in tCO₂/ha, need to convert to tC/ha
    biomass = ipccFactor.biomassPerHectare / CARBON_TO_CO2_RATIO;
    biomassSource = `IPCC 2019 Factors (${ipccFactor.name})`;
  }

  // 2. Get project type factor
  const projectFactorKey = mapProjectTypeToFactorKey(projectType);
  const projectFactor = PROJECT_FACTORS[projectFactorKey];

  // 3. Calculate annual CO₂ capture
  // Formula: CO₂ = Area × Biomass × CO₂_ratio × Project_Factor
  const estimatedCo2TonsYear = areaHectares * biomass * CARBON_TO_CO2_RATIO * projectFactor;

  // 4. Calculate total CO₂ for project duration (if provided)
  const totalCo2Tons = durationYears ? estimatedCo2TonsYear * durationYears : undefined;

  // 5. Calculate revenue estimates
  const revenueEstimate: CarbonRevenueEstimate = {
    conservative: estimatedCo2TonsYear * CARBON_MARKET_PRICES.conservative.pricePerTon,
    realistic: estimatedCo2TonsYear * CARBON_MARKET_PRICES.realistic.pricePerTon,
    optimistic: estimatedCo2TonsYear * CARBON_MARKET_PRICES.optimistic.pricePerTon,
    currency: 'USD',
    perYear: true,
  };

  // 6. Build methodology description
  const methodology = [
    `Área: ${areaHectares.toFixed(2)} ha`,
    `Biomasa: ${biomass.toFixed(2)} tC/ha (${biomassSource})`,
    `Factor de conversión C→CO₂: ${CARBON_TO_CO2_RATIO}`,
    `Factor de proyecto (${projectType}): ${projectFactor}`,
    `Fórmula: ${areaHectares.toFixed(2)} ha × ${biomass.toFixed(2)} tC/ha × ${CARBON_TO_CO2_RATIO} × ${projectFactor}`,
    `Resultado: ${estimatedCo2TonsYear.toFixed(2)} tCO₂/año`,
  ].join(' | ');

  return {
    estimatedCo2TonsYear: Math.round(estimatedCo2TonsYear * 100) / 100,
    totalCo2Tons: totalCo2Tons ? Math.round(totalCo2Tons * 100) / 100 : undefined,
    biomassUsed: Math.round(biomass * 100) / 100,
    conversionFactor: projectFactor,
    areaHectares,
    methodology,
    revenueEstimate,
  };
}

/**
 * Calculate carbon capture using department as fallback when GEE is unavailable
 */
export function calculateCarbonCaptureByDepartment(
  areaHectares: number,
  projectType: ProjectType,
  department: string,
  durationYears?: number
): CarbonCalculationOutput {
  const ipccFactor = getIPCCFactorByDepartment(department);
  const biomass = ipccFactor.biomassPerHectare / CARBON_TO_CO2_RATIO;

  // Map local forest type to GEE forest type for consistency
  const geeForestType: GEEForestType =
    ipccFactor.forestType === 'amazon' ? GEEForestType.AMAZONIA :
    ipccFactor.forestType === 'chiquitania' ? GEEForestType.CHIQUITANIA :
    ipccFactor.forestType === 'yungas' ? GEEForestType.YUNGAS :
    GEEForestType.ALTIPLANO;

  return calculateCarbonCapture({
    areaHectares,
    projectType,
    forestType: geeForestType,
    biomassPerHectare: biomass,
    durationYears,
  });
}

/**
 * Calculate CO₂ sequestration for multiple years
 * Useful for projections and graphs
 */
export function calculateMultiYearProjection(
  input: CarbonCalculationInput,
  years: number
): Array<{
  year: number;
  co2TonsYear: number;
  cumulativeCo2Tons: number;
  revenue: CarbonRevenueEstimate;
}> {
  const baseCalculation = calculateCarbonCapture(input);
  const projection = [];
  let cumulative = 0;

  for (let year = 1; year <= years; year++) {
    // For simplicity, assume constant annual capture
    // In reality, reforestation projects would have increasing rates
    const annualCo2 = baseCalculation.estimatedCo2TonsYear;
    cumulative += annualCo2;

    projection.push({
      year,
      co2TonsYear: Math.round(annualCo2 * 100) / 100,
      cumulativeCo2Tons: Math.round(cumulative * 100) / 100,
      revenue: {
        conservative: annualCo2 * CARBON_MARKET_PRICES.conservative.pricePerTon,
        realistic: annualCo2 * CARBON_MARKET_PRICES.realistic.pricePerTon,
        optimistic: annualCo2 * CARBON_MARKET_PRICES.optimistic.pricePerTon,
        currency: 'USD' as const,
        perYear: true,
      },
    });
  }

  return projection;
}

/**
 * Estimate potential carbon credits that could be generated
 */
export function estimateCarbonCredits(
  co2TonsYear: number,
  years: number = 10,
  verificationRate: number = 0.9 // 90% of theoretical capacity gets verified
): {
  annualCredits: number;
  totalCredits: number;
  verificationRate: number;
} {
  const annualCredits = co2TonsYear * verificationRate;
  const totalCredits = annualCredits * years;

  return {
    annualCredits: Math.round(annualCredits * 100) / 100,
    totalCredits: Math.round(totalCredits * 100) / 100,
    verificationRate,
  };
}

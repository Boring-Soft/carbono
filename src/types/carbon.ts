/**
 * Carbon Calculation Types
 * Types for calculating carbon capture and sequestration
 */

import { ProjectType } from '@prisma/client';
import { ForestType } from './gee';

/**
 * Input for carbon calculation
 */
export interface CarbonCalculationInput {
  areaHectares: number;
  projectType: ProjectType;
  forestType: ForestType;
  biomassPerHectare?: number; // From GEE, in tC/ha
  durationYears?: number; // Project duration for total calculation
}

/**
 * Output from carbon calculation
 */
export interface CarbonCalculationOutput {
  estimatedCo2TonsYear: number; // Annual CO₂ capture in tons
  totalCo2Tons?: number; // Total for project duration (if durationYears provided)
  biomassUsed: number; // Biomass value used in calculation (tC/ha)
  conversionFactor: number; // IPCC factor used
  areaHectares: number;
  methodology: string; // Description of calculation method
  revenueEstimate: CarbonRevenueEstimate;
}

/**
 * Revenue estimates based on market prices
 */
export interface CarbonRevenueEstimate {
  conservative: number; // Low price scenario ($5/ton)
  realistic: number; // Mid price scenario ($15/ton)
  optimistic: number; // High price scenario ($50/ton)
  currency: 'USD';
  perYear: boolean; // true if annual, false if total
}

/**
 * IPCC carbon conversion factors by forest type
 * Values represent tons of carbon per hectare (tC/ha)
 */
export interface IPCCFactors {
  [ForestType.AMAZONIA]: number; // 150 tC/ha
  [ForestType.CHIQUITANIA]: number; // 120 tC/ha
  [ForestType.YUNGAS]: number; // 130 tC/ha
  [ForestType.ALTIPLANO]: number; // 40 tC/ha
  [ForestType.MIXED]: number; // Average
  [ForestType.UNKNOWN]: number; // Default conservative value
}

/**
 * Carbon market prices per ton of CO₂
 */
export interface CarbonMarketPrices {
  conservative: number; // $5/ton
  realistic: number; // $15/ton
  optimistic: number; // $50/ton
  currency: 'USD';
  lastUpdated: Date;
}

/**
 * Carbon credit certificate
 */
export interface CarbonCreditCertificate {
  projectId: string;
  projectName: string;
  tonsCo2: number;
  verificationDate: Date;
  certificationBody: string; // 'Verra', 'Gold Standard', etc.
  certificateNumber?: string;
  vintage: number; // Year
  methodology: string;
  status: 'pending' | 'verified' | 'sold' | 'retired';
}

/**
 * Sequestration rate by project type
 * Annual CO₂ sequestration rate as percentage of total capacity
 */
export interface SequestrationRate {
  [ProjectType.REDD_PLUS]: number; // Conservation: 100% from year 1
  [ProjectType.REFORESTATION]: number; // Gradual increase: ~20% year 1, 100% year 10
  [ProjectType.RENEWABLE_ENERGY]: number; // Immediate: 100%
  [ProjectType.REGENERATIVE_AGRICULTURE]: number; // Gradual: ~30% year 1, 100% year 5
  [ProjectType.COMMUNITY_CONSERVATION]: number; // Conservation: 100% from year 1
}

/**
 * Carbon calculation by year (for multi-year projections)
 */
export interface CarbonProjection {
  year: number;
  co2TonsYear: number;
  cumulativeCo2Tons: number;
  sequestrationRate: number; // Percentage (0-100)
  revenueEstimate: CarbonRevenueEstimate;
}

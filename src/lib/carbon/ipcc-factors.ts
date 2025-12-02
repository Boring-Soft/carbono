/**
 * Factores de captura de carbono según el IPCC (2019)
 * Para diferentes tipos de bosque bolivianos
 *
 * IMPORTANTE: Estos valores representan la TASA DE CAPTURA ANUAL (flujo),
 * NO la biomasa total acumulada (stock).
 *
 * Valores expresados en toneladas de CO₂ capturadas por hectárea por año (tCO₂/ha/año)
 * Basados en:
 * - IPCC 2019 Refinement to the 2006 IPCC Guidelines for National Greenhouse Gas Inventories
 * - FAO Global Forest Resources Assessment 2020
 * - Estudios específicos de Bolivia (ABT, FAN)
 */

export type ForestType = 'amazon' | 'chiquitania' | 'yungas' | 'altiplano';

export interface IPCCFactor {
  forestType: ForestType;
  name: string;
  region: string;
  biomassPerHectare: number; // tCO₂/ha/año - TASA DE CAPTURA ANUAL
  source: string;
  departments: string[];
}

/**
 * Tasas de captura anual de CO₂ por tipo de bosque boliviano
 * Valores conservadores basados en literatura científica
 */
export const IPCC_FACTORS: Record<ForestType, IPCCFactor> = {
  amazon: {
    forestType: 'amazon',
    name: 'Amazonía Tropical',
    region: 'Norte de Bolivia',
    biomassPerHectare: 10, // tCO₂/ha/año (rango: 5-15)
    source: 'IPCC 2019 - Tropical Rainforest (Table 4.12)',
    departments: ['Pando', 'Beni', 'La Paz'],
  },
  chiquitania: {
    forestType: 'chiquitania',
    name: 'Bosque Seco Chiquitano',
    region: 'Este de Bolivia',
    biomassPerHectare: 5.5, // tCO₂/ha/año (rango: 3-8)
    source: 'IPCC 2019 - Tropical Dry Forest (Table 4.12)',
    departments: ['Santa Cruz'],
  },
  yungas: {
    forestType: 'yungas',
    name: 'Yungas',
    region: 'Valles de Bolivia',
    biomassPerHectare: 8, // tCO₂/ha/año (rango: 4-12)
    source: 'IPCC 2019 - Subtropical Forest (Table 4.12)',
    departments: ['Cochabamba', 'Tarija', 'Chuquisaca'],
  },
  altiplano: {
    forestType: 'altiplano',
    name: 'Altiplano Semiárido',
    region: 'Altiplano Boliviano',
    biomassPerHectare: 2, // tCO₂/ha/año (rango: 1-3)
    source: 'IPCC 2019 - Shrubland/Grassland (Table 6.2)',
    departments: ['Potosí', 'Oruro'],
  },
} as const;

/**
 * Factores de proyecto para diferentes tipos de intervención
 * Ajustan el cálculo de captura de CO₂ según la naturaleza del proyecto
 */
export const PROJECT_FACTORS = {
  REDD_PLUS: 0.9, // Evitar deforestación (REDD+)
  REFORESTATION: 1.2, // Reforestación activa
  COMMUNITY_CONSERVATION: 1.0, // Conservación comunitaria
  RENEWABLE_ENERGY: 0.8, // Energías renovables (estimación)
  REGENERATIVE_AGRICULTURE: 0.7, // Agricultura regenerativa
} as const;

/**
 * Mapeo de departamentos a tipos de bosque predominantes
 * Para usar como fallback cuando GEE no puede determinar el tipo de bosque
 */
export const DEPARTMENT_TO_FOREST_TYPE: Record<string, ForestType> = {
  'La Paz': 'amazon',
  'Pando': 'amazon',
  'Beni': 'amazon',
  'Santa Cruz': 'chiquitania',
  'Cochabamba': 'yungas',
  'Tarija': 'yungas',
  'Chuquisaca': 'yungas',
  'Potosí': 'altiplano',
  'Oruro': 'altiplano',
} as const;

/**
 * Obtiene el factor de emisión para un departamento específico
 * Usa el mapeo departamento → tipo de bosque como fallback
 */
export function getIPCCFactorByDepartment(department: string): IPCCFactor {
  const forestType = DEPARTMENT_TO_FOREST_TYPE[department] || 'yungas'; // Yungas como default
  return IPCC_FACTORS[forestType];
}

/**
 * Obtiene el factor de emisión basado en el tipo de bosque detectado por GEE
 */
export function getIPCCFactorByForestType(forestType: ForestType): IPCCFactor {
  return IPCC_FACTORS[forestType];
}

/**
 * Obtiene el factor de proyecto según el tipo de intervención
 */
export function getProjectFactor(
  projectType: keyof typeof PROJECT_FACTORS
): number {
  return PROJECT_FACTORS[projectType] || 1.0;
}

/**
 * Lista de todos los tipos de bosque disponibles
 */
export const FOREST_TYPES = Object.keys(IPCC_FACTORS) as ForestType[];

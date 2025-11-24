/**
 * Factores de emisión de carbono según el IPCC (2019)
 * Para diferentes tipos de bosque bolivianos
 * Valores expresados en toneladas de CO₂ por hectárea por año (tCO₂/ha/año)
 */

export type ForestType = 'amazon' | 'chiquitania' | 'yungas' | 'altiplano';

export interface IPCCFactor {
  forestType: ForestType;
  name: string;
  region: string;
  biomassPerHectare: number; // tCO₂/ha/año
  source: string;
  departments: string[];
}

/**
 * Factores de emisión por tipo de bosque boliviano
 * Basados en estudios del IPCC 2019 y adaptados para Bolivia
 */
export const IPCC_FACTORS: Record<ForestType, IPCCFactor> = {
  amazon: {
    forestType: 'amazon',
    name: 'Amazonía Tropical',
    region: 'Norte de Bolivia',
    biomassPerHectare: 150, // tCO₂/ha/año
    source: 'IPCC 2019 - Tropical Rainforest',
    departments: ['Pando', 'Beni', 'La Paz'],
  },
  chiquitania: {
    forestType: 'chiquitania',
    name: 'Bosque Seco Chiquitano',
    region: 'Este de Bolivia',
    biomassPerHectare: 120, // tCO₂/ha/año
    source: 'IPCC 2019 - Tropical Dry Forest',
    departments: ['Santa Cruz'],
  },
  yungas: {
    forestType: 'yungas',
    name: 'Yungas',
    region: 'Valles de Bolivia',
    biomassPerHectare: 130, // tCO₂/ha/año
    source: 'IPCC 2019 - Subtropical Forest',
    departments: ['Cochabamba', 'Tarija', 'Chuquisaca'],
  },
  altiplano: {
    forestType: 'altiplano',
    name: 'Altiplano Semiárido',
    region: 'Altiplano Boliviano',
    biomassPerHectare: 40, // tCO₂/ha/año
    source: 'IPCC 2019 - Shrubland/Grassland',
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

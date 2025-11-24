/**
 * Precios de mercado de créditos de carbono
 * Valores en USD por tonelada de CO₂
 * Actualizados según mercados voluntarios 2024-2025
 */

export interface CarbonPrice {
  pricePerTon: number; // USD/tCO₂
  label: string;
  description: string;
  marketReference: string;
}

/**
 * Precios de referencia para créditos de carbono
 * Se usan tres escenarios para dar rangos de ingresos proyectados
 */
export const CARBON_MARKET_PRICES = {
  conservative: {
    pricePerTon: 5,
    label: 'Conservador',
    description: 'Precio mínimo del mercado voluntario',
    marketReference: 'Mercado Voluntario - Promedio bajo',
  },
  realistic: {
    pricePerTon: 15,
    label: 'Realista',
    description: 'Precio promedio del mercado voluntario actual',
    marketReference: 'Ecosystem Marketplace 2024',
  },
  optimistic: {
    pricePerTon: 50,
    label: 'Optimista',
    description: 'Proyectos premium con co-beneficios comunitarios',
    marketReference: 'Gold Standard - Proyectos indígenas',
  },
} as const;

export type PriceScenario = keyof typeof CARBON_MARKET_PRICES;

/**
 * Precios especiales para proyectos con características premium
 * Estos pueden alcanzar valores más altos en mercados especializados
 */
export const PREMIUM_PROJECT_PRICES = {
  indigenous_community: {
    pricePerTon: 80,
    label: 'Proyecto Indígena Certificado',
    description: 'Proyectos con comunidades indígenas y co-beneficios demostrados',
    marketReference: 'Gold Standard + CCB Standards',
  },
  biodiversity_hotspot: {
    pricePerTon: 70,
    label: 'Hotspot de Biodiversidad',
    description: 'Áreas de alta biodiversidad con certificación adicional',
    marketReference: 'Verra + Climate Community & Biodiversity',
  },
  high_risk_avoided: {
    pricePerTon: 60,
    label: 'Alto Riesgo de Deforestación Evitado',
    description: 'REDD+ en zonas de alto riesgo comprobado',
    marketReference: 'Verra VCS + Alto nivel de amenaza',
  },
} as const;

/**
 * Duración estándar de proyectos de carbono (años)
 * Usado para calcular ingresos proyectados totales
 */
export const DEFAULT_PROJECT_DURATION_YEARS = 30;

/**
 * Años de acreditación típicos para proyectos REDD+/Forestales
 */
export const ACCREDITATION_PERIOD_YEARS = {
  short: 10,
  medium: 20,
  long: 30,
} as const;

/**
 * Calcula los ingresos potenciales en los tres escenarios
 */
export interface RevenueCalculation {
  conservative: number;
  realistic: number;
  optimistic: number;
}

export function calculateRevenue(
  co2TonsPerYear: number,
  years: number = DEFAULT_PROJECT_DURATION_YEARS
): {
  annual: RevenueCalculation;
  total: RevenueCalculation;
} {
  const annual: RevenueCalculation = {
    conservative:
      co2TonsPerYear * CARBON_MARKET_PRICES.conservative.pricePerTon,
    realistic: co2TonsPerYear * CARBON_MARKET_PRICES.realistic.pricePerTon,
    optimistic: co2TonsPerYear * CARBON_MARKET_PRICES.optimistic.pricePerTon,
  };

  const total: RevenueCalculation = {
    conservative: annual.conservative * years,
    realistic: annual.realistic * years,
    optimistic: annual.optimistic * years,
  };

  return { annual, total };
}

/**
 * Formatea un valor de dinero en USD
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea un valor de dinero en USD compacto (con K, M, B)
 */
export function formatUSDCompact(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Obtiene el precio por tonelada según el escenario
 */
export function getPricePerTon(scenario: PriceScenario): number {
  return CARBON_MARKET_PRICES[scenario].pricePerTon;
}

/**
 * Obtiene información completa del precio según el escenario
 */
export function getPriceInfo(scenario: PriceScenario): CarbonPrice {
  return CARBON_MARKET_PRICES[scenario];
}

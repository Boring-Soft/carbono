/**
 * Coordenadas geográficas de Bolivia
 * Bounding box y coordenadas de capitales departamentales
 */

export interface DepartmentCoordinates {
  name: string;
  capital: string;
  latitude: number;
  longitude: number;
}

/**
 * Bounding box de Bolivia (para NASA FIRMS API)
 * Formato: [min_lon, min_lat, max_lon, max_lat]
 */
export const BOLIVIA_BBOX = {
  minLon: -69.6,
  minLat: -23.0,
  maxLon: -57.5,
  maxLat: -10.0,
} as const;

/**
 * Bounding box como array para APIs que lo requieren
 * Formato: [min_lon, min_lat, max_lon, max_lat]
 */
export const BOLIVIA_BBOX_ARRAY = [
  BOLIVIA_BBOX.minLon,
  BOLIVIA_BBOX.minLat,
  BOLIVIA_BBOX.maxLon,
  BOLIVIA_BBOX.maxLat,
] as const;

/**
 * Coordenadas de las capitales de los 9 departamentos de Bolivia
 * Usadas para geocodificación inversa y centrado de mapas
 */
export const BOLIVIA_DEPARTMENTS: Record<string, DepartmentCoordinates> = {
  'La Paz': {
    name: 'La Paz',
    capital: 'La Paz',
    latitude: -16.5,
    longitude: -68.15,
  },
  'Santa Cruz': {
    name: 'Santa Cruz',
    capital: 'Santa Cruz de la Sierra',
    latitude: -17.78,
    longitude: -63.18,
  },
  'Cochabamba': {
    name: 'Cochabamba',
    capital: 'Cochabamba',
    latitude: -17.39,
    longitude: -66.16,
  },
  'Potosí': {
    name: 'Potosí',
    capital: 'Potosí',
    latitude: -19.58,
    longitude: -65.75,
  },
  'Oruro': {
    name: 'Oruro',
    capital: 'Oruro',
    latitude: -17.98,
    longitude: -67.13,
  },
  'Chuquisaca': {
    name: 'Chuquisaca',
    capital: 'Sucre',
    latitude: -19.03,
    longitude: -65.26,
  },
  'Tarija': {
    name: 'Tarija',
    capital: 'Tarija',
    latitude: -21.53,
    longitude: -64.73,
  },
  'Beni': {
    name: 'Beni',
    capital: 'Trinidad',
    latitude: -14.83,
    longitude: -64.90,
  },
  'Pando': {
    name: 'Pando',
    capital: 'Cobija',
    latitude: -11.03,
    longitude: -68.76,
  },
} as const;

/**
 * Lista de nombres de departamentos (para selects/dropdowns)
 */
export const DEPARTMENT_NAMES = Object.keys(BOLIVIA_DEPARTMENTS) as string[];

export type DepartmentName = keyof typeof BOLIVIA_DEPARTMENTS;

/**
 * Coordenadas del centro geográfico de Bolivia
 * Usadas para centrar el mapa por defecto
 */
export const BOLIVIA_CENTER = {
  latitude: -16.5,
  longitude: -64.5,
  zoom: 6, // Nivel de zoom apropiado para ver todo el país
} as const;

/**
 * Determina el departamento basado en coordenadas (geocodificación inversa simple)
 * Usa la distancia al capital más cercano como aproximación
 * Para geocodificación más precisa, usar límites departamentales poligonales
 */
export function getDepartmentFromCoordinates(
  latitude: number,
  longitude: number
): DepartmentName | null {
  if (!isPointInBolivia(latitude, longitude)) {
    return null;
  }

  let closestDepartment: DepartmentName | null = null;
  let minDistance = Infinity;

  for (const [name, coords] of Object.entries(BOLIVIA_DEPARTMENTS)) {
    const distance = Math.sqrt(
      Math.pow(coords.latitude - latitude, 2) +
        Math.pow(coords.longitude - longitude, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestDepartment = name as DepartmentName;
    }
  }

  return closestDepartment;
}

/**
 * Verifica si un punto está dentro del bounding box de Bolivia
 */
export function isPointInBolivia(
  latitude: number,
  longitude: number
): boolean {
  return (
    latitude >= BOLIVIA_BBOX.minLat &&
    latitude <= BOLIVIA_BBOX.maxLat &&
    longitude >= BOLIVIA_BBOX.minLon &&
    longitude <= BOLIVIA_BBOX.maxLon
  );
}

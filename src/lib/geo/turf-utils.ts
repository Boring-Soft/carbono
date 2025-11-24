/**
 * Geospatial Utilities using Turf.js
 * Provides functions for area calculation, distance measurement, and geometry validation
 */

import { area, distance, simplify, point } from '@turf/turf';
import type { Polygon, MultiPolygon, Position } from 'geojson';
import { BOLIVIA_BBOX } from './bolivia-boundaries';

/**
 * Calculate area of a polygon or multipolygon in hectares
 * @param geometry - GeoJSON Polygon or MultiPolygon
 * @returns Area in hectares
 */
export function calculatePolygonArea(
  geometry: Polygon | MultiPolygon
): number {
  try {
    // Turf area returns square meters
    const areaSquareMeters = area(geometry);

    // Convert to hectares (1 ha = 10,000 m²)
    const areaHectares = areaSquareMeters / 10000;

    return Math.round(areaHectares * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating polygon area:', error);
    throw new Error('Failed to calculate polygon area');
  }
}

/**
 * Calculate distance between two points in kilometers
 * @param point1 - [longitude, latitude]
 * @param point2 - [longitude, latitude]
 * @returns Distance in kilometers
 */
export function calculateDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  try {
    const from = point(point1);
    const to = point(point2);

    // Turf distance returns kilometers by default
    const distanceKm = distance(from, to, { units: 'kilometers' });

    return Math.round(distanceKm * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating distance:', error);
    throw new Error('Failed to calculate distance');
  }
}

/**
 * Check if a point is within Bolivia's bounding box
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns true if point is within Bolivia
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

/**
 * Check if a polygon is within Bolivia's bounding box
 * Validates that at least one vertex is within Bolivia
 * @param geometry - GeoJSON Polygon or MultiPolygon
 * @returns true if polygon is within Bolivia
 */
export function isPolygonInBolivia(
  geometry: Polygon | MultiPolygon
): boolean {
  try {
    const coordinates = geometry.type === 'Polygon'
      ? geometry.coordinates[0]
      : geometry.coordinates[0][0];

    // Check if at least one vertex is within Bolivia
    return coordinates.some(([lng, lat]: Position) =>
      isPointInBolivia(lat, lng)
    );
  } catch (error) {
    console.error('Error checking if polygon is in Bolivia:', error);
    return false;
  }
}

/**
 * Simplify a polygon to reduce number of vertices
 * Useful for reducing data size while maintaining shape
 * @param geometry - GeoJSON Polygon or MultiPolygon
 * @param tolerance - Simplification tolerance (default: 0.001)
 * @returns Simplified geometry
 */
export function simplifyPolygon(
  geometry: Polygon | MultiPolygon,
  tolerance: number = 0.001
): Polygon | MultiPolygon {
  try {
    // Wrap geometry in a Feature for turf.simplify
    const feature = {
      type: 'Feature' as const,
      properties: {},
      geometry,
    };
    const simplified = simplify(feature, { tolerance, highQuality: true });
    return simplified.geometry as Polygon | MultiPolygon;
  } catch (error) {
    console.error('Error simplifying polygon:', error);
    // Return original geometry if simplification fails
    return geometry;
  }
}

/**
 * Validate polygon geometry
 * Checks for basic validity requirements
 * @param geometry - GeoJSON Polygon or MultiPolygon
 * @returns Validation result with errors if any
 */
export function validatePolygon(
  geometry: Polygon | MultiPolygon
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    // Check geometry type
    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
      errors.push('Geometry must be a Polygon or MultiPolygon');
      return { valid: false, errors };
    }

    // Validate Polygon
    if (geometry.type === 'Polygon') {
      if (!geometry.coordinates || geometry.coordinates.length === 0) {
        errors.push('Polygon coordinates are empty');
      } else {
        // Check outer ring
        const outerRing = geometry.coordinates[0];
        if (outerRing.length < 4) {
          errors.push('Polygon must have at least 4 coordinates (3 vertices + closing point)');
        }

        // Check if first and last coordinates are the same (closed polygon)
        const first = outerRing[0];
        const last = outerRing[outerRing.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          errors.push('Polygon is not closed (first and last coordinates must be the same)');
        }
      }
    }

    // Validate MultiPolygon
    if (geometry.type === 'MultiPolygon') {
      if (!geometry.coordinates || geometry.coordinates.length === 0) {
        errors.push('MultiPolygon coordinates are empty');
      } else {
        geometry.coordinates.forEach((polygon, index) => {
          if (polygon.length === 0 || polygon[0].length < 4) {
            errors.push(`MultiPolygon polygon ${index} has insufficient coordinates`);
          }
        });
      }
    }

    // Check if polygon is in Bolivia
    if (errors.length === 0 && !isPolygonInBolivia(geometry)) {
      errors.push('Polygon must be located within Bolivia');
    }

    // Calculate area to ensure it's valid
    if (errors.length === 0) {
      try {
        const polygonArea = calculatePolygonArea(geometry);
        if (polygonArea <= 0) {
          errors.push('Polygon area must be greater than 0');
        }
        if (polygonArea > 10000000) { // 10 million hectares (larger than Bolivia)
          errors.push('Polygon area is unrealistically large');
        }
      } catch {
        errors.push('Failed to calculate polygon area');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Get centroid (center point) of a polygon
 * @param geometry - GeoJSON Polygon or MultiPolygon
 * @returns [longitude, latitude]
 */
export function getCentroid(
  geometry: Polygon | MultiPolygon
): [number, number] {
  try {
    const coordinates = geometry.type === 'Polygon'
      ? geometry.coordinates[0]
      : geometry.coordinates[0][0];

    // Calculate average of all coordinates
    let sumLng = 0;
    let sumLat = 0;
    const count = coordinates.length - 1; // Exclude closing point

    for (let i = 0; i < count; i++) {
      sumLng += coordinates[i][0];
      sumLat += coordinates[i][1];
    }

    return [
      Math.round((sumLng / count) * 1000000) / 1000000,
      Math.round((sumLat / count) * 1000000) / 1000000,
    ];
  } catch (error) {
    console.error('Error calculating centroid:', error);
    throw new Error('Failed to calculate centroid');
  }
}

/**
 * Get bounding box of a polygon
 * @param geometry - GeoJSON Polygon or MultiPolygon
 * @returns [minLng, minLat, maxLng, maxLat]
 */
export function getBoundingBox(
  geometry: Polygon | MultiPolygon
): [number, number, number, number] {
  try {
    const coordinates = geometry.type === 'Polygon'
      ? geometry.coordinates[0]
      : geometry.coordinates[0][0];

    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    coordinates.forEach(([lng, lat]: Position) => {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    });

    return [minLng, minLat, maxLng, maxLat];
  } catch (error) {
    console.error('Error calculating bounding box:', error);
    throw new Error('Failed to calculate bounding box');
  }
}

/**
 * Calculate perimeter of a polygon in kilometers
 * @param geometry - GeoJSON Polygon or MultiPolygon
 * @returns Perimeter in kilometers
 */
export function calculatePerimeter(
  geometry: Polygon | MultiPolygon
): number {
  try {
    const coordinates = geometry.type === 'Polygon'
      ? geometry.coordinates[0]
      : geometry.coordinates[0][0];

    let perimeter = 0;

    for (let i = 0; i < coordinates.length - 1; i++) {
      const point1: [number, number] = [coordinates[i][0], coordinates[i][1]];
      const point2: [number, number] = [coordinates[i + 1][0], coordinates[i + 1][1]];
      perimeter += calculateDistance(point1, point2);
    }

    return Math.round(perimeter * 100) / 100;
  } catch (error) {
    console.error('Error calculating perimeter:', error);
    throw new Error('Failed to calculate perimeter');
  }
}

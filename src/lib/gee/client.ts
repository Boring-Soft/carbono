/**
 * Google Earth Engine Client
 * Handles authentication and API calls to Google Earth Engine
 */

// @ts-expect-error - @google/earthengine doesn't have TypeScript declarations
import ee from '@google/earthengine';
import { ForestType } from '@/types/gee';
import { GEE_CONFIG, HANSEN_FOREST_CHANGE, MODIS_NDVI, NASA_BIOMASS } from './datasets';

let isInitialized = false;

/**
 * Initialize Earth Engine with service account credentials
 */
export async function initializeEarthEngine(): Promise<void> {
  if (isInitialized) {
    return;
  }

  const serviceAccountEmail = process.env.GEE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GEE_PRIVATE_KEY;

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Missing GEE credentials. Please set GEE_SERVICE_ACCOUNT_EMAIL and GEE_PRIVATE_KEY in .env');
  }

  return new Promise((resolve, reject) => {
    ee.data.authenticateViaPrivateKey(
      {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      () => {
        ee.initialize(
          null,
          null,
          () => {
            isInitialized = true;
            console.log('✓ Google Earth Engine initialized successfully');
            resolve();
          },
          (error: Error) => {
            console.error('Failed to initialize Earth Engine:', error);
            reject(error);
          }
        );
      },
      (error: Error) => {
        console.error('Failed to authenticate with Earth Engine:', error);
        reject(error);
      }
    );
  });
}

/**
 * Calculate forest coverage percentage for a given geometry
 */
export async function calculateForestCoverage(
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
): Promise<number> {
  await initializeEarthEngine();

  return new Promise((resolve, reject) => {
    try {
      const eeGeometry = ee.Geometry(geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon);

      // Use Hansen dataset to get tree cover
      const hansen = ee.Image(HANSEN_FOREST_CHANGE.id);
      const treeCover = hansen.select('treecover2000');

      // Calculate mean tree cover percentage
      const stats = treeCover.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: eeGeometry,
        scale: GEE_CONFIG.DEFAULT_SCALE,
        maxPixels: GEE_CONFIG.MAX_PIXELS,
      });

      stats.evaluate((result: Record<string, number> | null, error: Error | null) => {
        if (error) {
          reject(error);
        } else {
          const coverage = result?.treecover2000 || 0;
          resolve(Math.round(coverage * 100) / 100);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Calculate biomass per hectare using NASA biomass dataset
 */
export async function calculateBiomass(
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
): Promise<number> {
  await initializeEarthEngine();

  return new Promise((resolve, reject) => {
    try {
      const eeGeometry = ee.Geometry(geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon);

      // Use NASA biomass dataset
      const biomass = ee.Image(NASA_BIOMASS.id).select('agb');

      // Calculate mean biomass (Mg/ha = tons/ha)
      const stats = biomass.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: eeGeometry,
        scale: NASA_BIOMASS.resolution,
        maxPixels: GEE_CONFIG.MAX_PIXELS,
      });

      stats.evaluate((result: Record<string, number> | null, error: Error | null) => {
        if (error) {
          reject(error);
        } else {
          const biomassValue = result?.agb || 0;
          resolve(Math.round(biomassValue * 100) / 100);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Detect forest type based on location and characteristics
 */
export async function detectForestType(
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
): Promise<ForestType> {
  await initializeEarthEngine();

  return new Promise((resolve, reject) => {
    try {
      const eeGeometry = ee.Geometry(geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon);
      const centroid = eeGeometry.centroid();

      centroid.coordinates().evaluate((coords: [number, number], error: Error | null) => {
        if (error) {
          reject(error);
          return;
        }

        const [lng, lat] = coords;

        // Basic classification based on location in Bolivia
        // Amazonía: North and northeast (lat > -15, lng < -64)
        // Chiquitanía: East (lng > -62)
        // Yungas: West central (lng < -65, lat between -17 and -15)
        // Altiplano: Southwest (lat < -17, lng < -67)

        if (lat > -15 && lng < -64) {
          resolve(ForestType.AMAZONIA);
        } else if (lng > -62) {
          resolve(ForestType.CHIQUITANIA);
        } else if (lng < -65 && lat >= -17 && lat <= -15) {
          resolve(ForestType.YUNGAS);
        } else if (lat < -17 && lng < -67) {
          resolve(ForestType.ALTIPLANO);
        } else {
          resolve(ForestType.MIXED);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Detect forest loss in the area
 */
export async function detectForestLoss(
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
  startYear: number = 2020,
  endYear: number = 2023
): Promise<{ hasLoss: boolean; lossPercent: number; lastChangeYear: number | null }> {
  await initializeEarthEngine();

  return new Promise((resolve, reject) => {
    try {
      const eeGeometry = ee.Geometry(geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon);

      // Use Hansen dataset to detect loss
      const hansen = ee.Image(HANSEN_FOREST_CHANGE.id);
      const lossYear = hansen.select('lossyear');
      const loss = hansen.select('loss');

      // Calculate total area
      const totalArea = eeGeometry.area();

      // Create mask for loss years in range
      const lossInRange = lossYear.gte(startYear - 2000).and(lossYear.lte(endYear - 2000));
      const lossInRangeMasked = loss.updateMask(lossInRange);

      // Calculate loss area
      const lossAreaImage = lossInRangeMasked.multiply(ee.Image.pixelArea());

      const stats = ee.Dictionary({
        lossArea: lossAreaImage.reduceRegion({
          reducer: ee.Reducer.sum(),
          geometry: eeGeometry,
          scale: GEE_CONFIG.DEFAULT_SCALE,
          maxPixels: GEE_CONFIG.MAX_PIXELS,
        }).get('loss'),
        totalArea: totalArea,
        maxLossYear: lossYear.updateMask(lossInRange).reduceRegion({
          reducer: ee.Reducer.max(),
          geometry: eeGeometry,
          scale: GEE_CONFIG.DEFAULT_SCALE,
          maxPixels: GEE_CONFIG.MAX_PIXELS,
        }).get('lossyear'),
      });

      stats.evaluate((result: Record<string, number> | null, error: Error | null) => {
        if (error) {
          reject(error);
        } else {
          const lossArea = result?.lossArea || 0;
          const totalAreaValue = result?.totalArea || 1;
          const maxLossYear = result?.maxLossYear;

          const lossPercent = (lossArea / totalAreaValue) * 100;
          const hasLoss = lossPercent > 0.1; // Consider significant if > 0.1%
          const lastChangeYear = maxLossYear ? 2000 + maxLossYear : null;

          resolve({
            hasLoss,
            lossPercent: Math.round(lossPercent * 100) / 100,
            lastChangeYear,
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get NDVI time series for vegetation monitoring
 */
export async function getNDVITimeSeries(
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
  startDate: Date,
  endDate: Date
): Promise<Array<{ date: Date; ndvi: number }>> {
  await initializeEarthEngine();

  return new Promise((resolve, reject) => {
    try {
      const eeGeometry = ee.Geometry(geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon);

      // Use MODIS NDVI dataset
      const modis = ee.ImageCollection(MODIS_NDVI.id)
        .filterDate(startDate.toISOString(), endDate.toISOString())
        .filterBounds(eeGeometry);

      // Calculate mean NDVI for each image
      const ndviTimeSeries = modis.map((image: ee.Image) => {
        const ndvi = image.select('NDVI');
        const mean = ndvi.reduceRegion({
          reducer: ee.Reducer.mean(),
          geometry: eeGeometry,
          scale: MODIS_NDVI.resolution,
          maxPixels: GEE_CONFIG.MAX_PIXELS,
        });

        return ee.Feature(null, {
          date: image.date().millis(),
          ndvi: mean.get('NDVI'),
        });
      });

      ndviTimeSeries.evaluate((featureCollection: { features: Array<{ properties: { date: number; ndvi: number } }> } | null, error: Error | null) => {
        if (error) {
          reject(error);
        } else {
          const features = featureCollection?.features || [];
          const data = features
            .map((f: { properties: { date: number; ndvi: number } }) => ({
              date: new Date(f.properties.date),
              ndvi: (f.properties.ndvi / 10000) || 0, // MODIS NDVI is scaled by 10000
            }))
            .filter((d: { date: Date; ndvi: number }) => d.ndvi !== null && d.ndvi !== undefined);

          resolve(data);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Complete area analysis combining multiple datasets
 */
export async function analyzeArea(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon) {
  await initializeEarthEngine();

  const [forestCoverage, biomass, forestType, lossData] = await Promise.all([
    calculateForestCoverage(geometry),
    calculateBiomass(geometry),
    detectForestType(geometry),
    detectForestLoss(geometry),
  ]);

  return {
    forestCoveragePercent: forestCoverage,
    biomassPerHectare: biomass,
    forestType,
    lastChangeDetected: lossData.lastChangeYear
      ? new Date(`${lossData.lastChangeYear}-12-31`)
      : null,
    changePercent: lossData.lossPercent,
    verified: true,
    analysisDate: new Date(),
    dataSource: 'Hansen/NASA/MODIS',
    confidence: lossData.hasLoss ? 85 : 95, // Lower confidence if recent loss detected
  };
}

/**
 * Google Earth Engine Dataset Configurations
 * Configuration for satellite datasets used in forest monitoring and carbon calculations
 */

import { GEEDataset } from '@/types/gee';

/**
 * Hansen Global Forest Change Dataset
 * Provides annual forest cover loss data from 2000 to 2023
 * https://developers.google.com/earth-engine/datasets/catalog/UMD_hansen_global_forest_change_2023_v1_11
 */
export const HANSEN_FOREST_CHANGE: GEEDataset = {
  id: 'UMD/hansen/global_forest_change_2023_v1_11',
  name: 'Hansen Global Forest Change',
  description: 'Global forest cover change dataset with annual updates',
  resolution: 30, // meters
  temporalResolution: 'annual',
  bands: [
    'treecover2000', // Tree canopy cover for year 2000
    'loss', // Forest loss during 2000-2023
    'gain', // Forest gain during 2000-2012
    'lossyear', // Year of forest loss
    'datamask',
    'first',
    'last',
  ],
};

/**
 * Sentinel-2 Surface Reflectance Dataset
 * High-resolution multispectral imagery
 * https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR
 */
export const SENTINEL_2: GEEDataset = {
  id: 'COPERNICUS/S2_SR_HARMONIZED',
  name: 'Sentinel-2 MSI Level-2A',
  description: 'Multispectral instrument for vegetation monitoring',
  resolution: 10, // meters (for visible and NIR bands)
  temporalResolution: '5-day',
  bands: [
    'B2', // Blue
    'B3', // Green
    'B4', // Red
    'B8', // NIR (Near-Infrared) - for NDVI
    'B11', // SWIR 1
    'B12', // SWIR 2
    'QA60', // Quality band
  ],
};

/**
 * MODIS Terra Vegetation Indices
 * 16-day composite NDVI and EVI
 * https://developers.google.com/earth-engine/datasets/catalog/MODIS_006_MOD13A2
 */
export const MODIS_NDVI: GEEDataset = {
  id: 'MODIS/061/MOD13A2',
  name: 'MODIS Terra Vegetation Indices',
  description: '16-day 1km vegetation indices',
  resolution: 1000, // meters
  temporalResolution: '16-day',
  bands: [
    'NDVI', // Normalized Difference Vegetation Index
    'EVI', // Enhanced Vegetation Index
    'DetailedQA',
    'sur_refl_b01', // Red
    'sur_refl_b02', // NIR
  ],
};

/**
 * NASA Carbon Density Dataset
 * Aboveground biomass carbon density
 * https://developers.google.com/earth-engine/datasets/catalog/NASA_ORNL_biomass_carbon_density_v1
 */
export const NASA_BIOMASS: GEEDataset = {
  id: 'NASA/ORNL/biomass_carbon_density/v1',
  name: 'Aboveground Biomass Carbon',
  description: 'Aboveground biomass carbon density',
  resolution: 300, // meters
  temporalResolution: 'static (2010)',
  bands: [
    'agb', // Aboveground biomass (Mg/ha)
    'agb_uncertainty',
  ],
};

/**
 * JAXA ALOS Forest/Non-Forest Map
 * Annual forest cover classification
 * https://developers.google.com/earth-engine/datasets/catalog/JAXA_ALOS_PALSAR_YEARLY_FNF
 */
export const JAXA_FOREST_COVER: GEEDataset = {
  id: 'JAXA/ALOS/PALSAR/YEARLY/FNF',
  name: 'JAXA ALOS Forest/Non-Forest',
  description: 'Annual forest/non-forest classification',
  resolution: 25, // meters
  temporalResolution: 'annual',
  bands: ['fnf'], // 1=forest, 2=non-forest, 3=water
};

/**
 * Get dataset by ID
 */
export function getDataset(id: string): GEEDataset | undefined {
  const datasets = [
    HANSEN_FOREST_CHANGE,
    SENTINEL_2,
    MODIS_NDVI,
    NASA_BIOMASS,
    JAXA_FOREST_COVER,
  ];
  return datasets.find((ds) => ds.id === id);
}

/**
 * Dataset groups for different analysis types
 */
export const DATASET_GROUPS = {
  FOREST_COVER: [HANSEN_FOREST_CHANGE, JAXA_FOREST_COVER],
  VEGETATION_INDEX: [SENTINEL_2, MODIS_NDVI],
  BIOMASS: [NASA_BIOMASS],
  HIGH_RESOLUTION: [SENTINEL_2, JAXA_FOREST_COVER],
  TIME_SERIES: [MODIS_NDVI, HANSEN_FOREST_CHANGE],
};

/**
 * Default configuration for GEE analysis
 */
export const GEE_CONFIG = {
  DEFAULT_SCALE: 30, // meters per pixel
  DEFAULT_CRS: 'EPSG:4326', // WGS84
  MAX_PIXELS: 1e9, // Maximum pixels for computation
  BOLIVIA_BOUNDS: {
    type: 'Polygon' as const,
    coordinates: [
      [
        [-69.6, -23.0],
        [-69.6, -10.0],
        [-57.5, -10.0],
        [-57.5, -23.0],
        [-69.6, -23.0],
      ],
    ],
  },
};

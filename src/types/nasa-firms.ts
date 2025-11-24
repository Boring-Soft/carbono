/**
 * NASA FIRMS (Fire Information for Resource Management System) Types
 * Types for processing active fire/hotspot data from MODIS and VIIRS satellites
 */

export interface NASAFIRMSRawData {
  latitude: number;
  longitude: number;
  brightness: number; // Kelvin
  scan: number;
  track: number;
  acq_date: string; // YYYY-MM-DD
  acq_time: string; // HHMM
  satellite: 'Aqua' | 'Terra' | 'SNPP' | 'NOAA-20' | 'NOAA-21';
  instrument: 'MODIS' | 'VIIRS';
  confidence: number | string; // 0-100 for VIIRS, 'low'|'nominal'|'high' for MODIS
  version: string;
  bright_t31: number;
  frp: number; // Fire Radiative Power (MW)
  daynight: 'D' | 'N';
}

export interface NASAFIRMSParsedAlert {
  latitude: number;
  longitude: number;
  brightness: number;
  confidence: number; // Normalized to 0-100
  acquisitionDate: Date;
  satellite: string;
  instrument: string;
  frp: number;
  dayNight: 'DAY' | 'NIGHT';
  department?: string; // Detected via geocoding
  municipality?: string;
}

export interface NASAFIRMSAPIConfig {
  apiKey: string;
  baseUrl: string;
  source: 'MODIS_NRT' | 'VIIRS_NOAA20_NRT' | 'VIIRS_SNPP_NRT';
  dayRange: number; // Number of days to fetch (1-10)
}

export interface NASAFIRMSBoundingBox {
  west: number; // min longitude
  south: number; // min latitude
  east: number; // max longitude
  north: number; // max latitude
}

export interface NASAFIRMSQueryParams {
  bbox: NASAFIRMSBoundingBox;
  source: string;
  dayRange: number;
  date?: string; // YYYY-MM-DD format for specific date
}

// Bolivia bounding box constants
export const BOLIVIA_BBOX: NASAFIRMSBoundingBox = {
  west: -69.6,
  south: -23.0,
  east: -57.5,
  north: -10.0,
};

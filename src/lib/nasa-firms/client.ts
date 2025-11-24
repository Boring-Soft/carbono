/**
 * NASA FIRMS Client
 * HTTP client for NASA Fire Information for Resource Management System (FIRMS) API
 * https://firms.modaps.eosdis.nasa.gov/api/
 */

import axios, { AxiosInstance } from 'axios';
import {
  NASAFIRMSAPIConfig,
  NASAFIRMSBoundingBox,
  NASAFIRMSQueryParams,
  BOLIVIA_BBOX,
} from '@/types/nasa-firms';

export class NASAFIRMSClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor(config?: Partial<NASAFIRMSAPIConfig>) {
    this.apiKey = config?.apiKey || process.env.NASA_FIRMS_KEY || '';
    this.baseUrl = config?.baseUrl || 'https://firms.modaps.eosdis.nasa.gov/api/area/csv';

    if (!this.apiKey) {
      throw new Error('NASA FIRMS API key is required. Set NASA_FIRMS_KEY in .env');
    }

    this.client = axios.create({
      timeout: 30000, // 30 seconds
      headers: {
        'User-Agent': 'CARBONO-Bolivia/1.0',
      },
    });
  }

  /**
   * Fetch active fires from NASA FIRMS API
   * @param params Query parameters
   * @returns CSV string with fire data
   */
  async fetchFires(params: NASAFIRMSQueryParams): Promise<string> {
    const { bbox, source, dayRange, date } = params;

    // Build URL
    // Format: https://firms.modaps.eosdis.nasa.gov/api/area/csv/{API_KEY}/{SOURCE}/{BBOX}/{DAY_RANGE}/{DATE}
    let url = `${this.baseUrl}/${this.apiKey}/${source}/${bbox.west},${bbox.south},${bbox.east},${bbox.north}/${dayRange}`;

    if (date) {
      url += `/${date}`;
    }

    try {
      const response = await this.client.get(url);

      if (response.status !== 200) {
        throw new Error(`NASA FIRMS API returned status ${response.status}`);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid NASA FIRMS API key');
        } else if (error.response?.status === 429) {
          throw new Error('NASA FIRMS API rate limit exceeded');
        }
        throw new Error(`NASA FIRMS API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetch fires for Bolivia using VIIRS NOAA-20 sensor (high quality)
   * @param dayRange Number of days to fetch (1-10)
   * @returns CSV string with fire data
   */
  async fetchBoliviaFires(dayRange: number = 1): Promise<string> {
    return this.fetchFires({
      bbox: BOLIVIA_BBOX,
      source: 'VIIRS_NOAA20_NRT', // Near Real-Time VIIRS data from NOAA-20
      dayRange,
    });
  }

  /**
   * Fetch fires for a custom bounding box
   * @param bbox Bounding box coordinates
   * @param dayRange Number of days to fetch (1-10)
   * @param source Data source (default: VIIRS_NOAA20_NRT)
   * @returns CSV string with fire data
   */
  async fetchFiresForArea(
    bbox: NASAFIRMSBoundingBox,
    dayRange: number = 1,
    source: string = 'VIIRS_NOAA20_NRT'
  ): Promise<string> {
    return this.fetchFires({
      bbox,
      source,
      dayRange,
    });
  }

  /**
   * Fetch fires from multiple sources for redundancy
   * @param bbox Bounding box coordinates
   * @param dayRange Number of days to fetch
   * @returns Combined CSV data from all sources
   */
  async fetchFiresMultiSource(
    bbox: NASAFIRMSBoundingBox,
    dayRange: number = 1
  ): Promise<string[]> {
    const sources = [
      'VIIRS_NOAA20_NRT', // NOAA-20 satellite
      'VIIRS_SNPP_NRT', // Suomi NPP satellite
      'MODIS_NRT', // MODIS on Aqua and Terra
    ];

    const results = await Promise.allSettled(
      sources.map((source) =>
        this.fetchFires({
          bbox,
          source,
          dayRange,
        })
      )
    );

    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<string>).value);
  }

  /**
   * Test API key validity
   * @returns true if API key is valid
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to fetch 1 day of data for a small area
      await this.fetchFires({
        bbox: {
          west: -65,
          south: -17,
          east: -64,
          north: -16,
        },
        source: 'VIIRS_NOAA20_NRT',
        dayRange: 1,
      });
      return true;
    } catch (error) {
      console.error('NASA FIRMS connection test failed:', error);
      return false;
    }
  }
}

/**
 * Get default NASA FIRMS client instance
 */
export function getNASAFIRMSClient(): NASAFIRMSClient {
  return new NASAFIRMSClient();
}

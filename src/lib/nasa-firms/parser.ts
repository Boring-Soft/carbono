/**
 * NASA FIRMS Data Parser
 * Parses CSV data from NASA FIRMS API into structured TypeScript objects
 * Performs geocoding to identify department for each fire alert
 */

import { NASAFIRMSRawData, NASAFIRMSParsedAlert } from '@/types/nasa-firms';
import { getDepartmentFromCoordinates } from '@/lib/geo/bolivia-boundaries';

/**
 * Parse CSV line into raw data object
 * CSV format: latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_t31,frp,daynight
 */
function parseCSVLine(line: string, headers: string[]): NASAFIRMSRawData | null {
  const values = line.split(',');

  if (values.length !== headers.length) {
    return null;
  }

  const data: any = {};
  headers.forEach((header, index) => {
    data[header] = values[index];
  });

  // Validate required fields
  if (!data.latitude || !data.longitude || !data.acq_date || !data.acq_time) {
    return null;
  }

  return {
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    brightness: parseFloat(data.brightness),
    scan: parseFloat(data.scan),
    track: parseFloat(data.track),
    acq_date: data.acq_date,
    acq_time: data.acq_time,
    satellite: data.satellite,
    instrument: data.instrument,
    confidence: data.confidence,
    version: data.version,
    bright_t31: parseFloat(data.bright_t31),
    frp: parseFloat(data.frp),
    daynight: data.daynight,
  };
}

/**
 * Normalize confidence to 0-100 scale
 * VIIRS uses numeric 0-100, MODIS uses 'low'/'nominal'/'high'
 */
function normalizeConfidence(confidence: number | string): number {
  if (typeof confidence === 'number') {
    return confidence;
  }

  const confidenceStr = confidence.toLowerCase();
  if (confidenceStr === 'low') return 30;
  if (confidenceStr === 'nominal') return 60;
  if (confidenceStr === 'high') return 90;

  return 0;
}

/**
 * Parse acquisition date and time into Date object
 */
function parseAcquisitionDateTime(acq_date: string, acq_time: string): Date {
  // acq_date format: YYYY-MM-DD
  // acq_time format: HHMM (24-hour format)

  const [year, month, day] = acq_date.split('-').map(Number);
  const hours = Math.floor(parseInt(acq_time) / 100);
  const minutes = parseInt(acq_time) % 100;

  return new Date(Date.UTC(year, month - 1, day, hours, minutes));
}

/**
 * Convert raw data to parsed alert with geocoding
 */
function rawToAlert(raw: NASAFIRMSRawData): NASAFIRMSParsedAlert {
  const department = getDepartmentFromCoordinates(raw.latitude, raw.longitude);

  return {
    latitude: raw.latitude,
    longitude: raw.longitude,
    brightness: raw.brightness,
    confidence: normalizeConfidence(raw.confidence),
    acquisitionDate: parseAcquisitionDateTime(raw.acq_date, raw.acq_time),
    satellite: raw.satellite,
    instrument: raw.instrument,
    frp: raw.frp,
    dayNight: raw.daynight === 'D' ? 'DAY' : 'NIGHT',
    department: department || undefined,
  };
}

/**
 * Parse NASA FIRMS CSV data into structured alerts
 * @param csvData Raw CSV string from NASA FIRMS API
 * @returns Array of parsed alerts
 */
export function parseNASAFIRMSData(csvData: string): NASAFIRMSParsedAlert[] {
  const lines = csvData.trim().split('\n');

  if (lines.length < 2) {
    // No data (only header or empty)
    return [];
  }

  // First line is headers
  const headers = lines[0].split(',');

  // Parse remaining lines
  const alerts: NASAFIRMSParsedAlert[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const raw = parseCSVLine(line, headers);
    if (!raw) {
      console.warn(`Failed to parse line ${i}: ${line}`);
      continue;
    }

    try {
      const alert = rawToAlert(raw);
      alerts.push(alert);
    } catch (error) {
      console.error(`Error converting raw data to alert on line ${i}:`, error);
    }
  }

  return alerts;
}

/**
 * Filter alerts by confidence threshold
 */
export function filterByConfidence(
  alerts: NASAFIRMSParsedAlert[],
  minConfidence: number
): NASAFIRMSParsedAlert[] {
  return alerts.filter((alert) => alert.confidence >= minConfidence);
}

/**
 * Filter alerts by Fire Radiative Power (FRP) threshold
 */
export function filterByFRP(
  alerts: NASAFIRMSParsedAlert[],
  minFRP: number
): NASAFIRMSParsedAlert[] {
  return alerts.filter((alert) => alert.frp >= minFRP);
}

/**
 * Filter alerts by department
 */
export function filterByDepartment(
  alerts: NASAFIRMSParsedAlert[],
  department: string
): NASAFIRMSParsedAlert[] {
  return alerts.filter((alert) => alert.department === department);
}

/**
 * Group alerts by department
 */
export function groupByDepartment(
  alerts: NASAFIRMSParsedAlert[]
): Record<string, NASAFIRMSParsedAlert[]> {
  const grouped: Record<string, NASAFIRMSParsedAlert[]> = {};

  for (const alert of alerts) {
    const dept = alert.department || 'Unknown';
    if (!grouped[dept]) {
      grouped[dept] = [];
    }
    grouped[dept].push(alert);
  }

  return grouped;
}

/**
 * Calculate severity based on confidence and FRP
 */
export function calculateSeverity(
  alert: NASAFIRMSParsedAlert
): 'LOW' | 'MEDIUM' | 'HIGH' {
  // High severity: high confidence AND high FRP
  if (alert.confidence >= 80 && alert.frp >= 100) {
    return 'HIGH';
  }

  // Medium severity: moderate confidence OR moderate FRP
  if (alert.confidence >= 50 || alert.frp >= 50) {
    return 'MEDIUM';
  }

  // Low severity: everything else
  return 'LOW';
}

/**
 * Deduplicate alerts that are very close together (within 500m)
 * Keeps the alert with highest confidence
 */
export function deduplicateAlerts(
  alerts: NASAFIRMSParsedAlert[]
): NASAFIRMSParsedAlert[] {
  const DISTANCE_THRESHOLD = 0.005; // ~500m in degrees (approximate)

  const deduplicated: NASAFIRMSParsedAlert[] = [];

  for (const alert of alerts) {
    // Check if this alert is close to any already added
    const isDuplicate = deduplicated.some((existing) => {
      const latDiff = Math.abs(existing.latitude - alert.latitude);
      const lngDiff = Math.abs(existing.longitude - alert.longitude);
      return latDiff < DISTANCE_THRESHOLD && lngDiff < DISTANCE_THRESHOLD;
    });

    if (!isDuplicate) {
      deduplicated.push(alert);
    } else {
      // Replace if this one has higher confidence
      const closeIndex = deduplicated.findIndex((existing) => {
        const latDiff = Math.abs(existing.latitude - alert.latitude);
        const lngDiff = Math.abs(existing.longitude - alert.longitude);
        return latDiff < DISTANCE_THRESHOLD && lngDiff < DISTANCE_THRESHOLD;
      });

      if (closeIndex !== -1 && alert.confidence > deduplicated[closeIndex].confidence) {
        deduplicated[closeIndex] = alert;
      }
    }
  }

  return deduplicated;
}

/**
 * Get summary statistics for a set of alerts
 */
export function getAlertStats(alerts: NASAFIRMSParsedAlert[]) {
  if (alerts.length === 0) {
    return {
      total: 0,
      byDepartment: {},
      bySeverity: { LOW: 0, MEDIUM: 0, HIGH: 0 },
      avgConfidence: 0,
      avgFRP: 0,
    };
  }

  const byDepartment = groupByDepartment(alerts);
  const bySeverity = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
  };

  let totalConfidence = 0;
  let totalFRP = 0;

  for (const alert of alerts) {
    const severity = calculateSeverity(alert);
    bySeverity[severity]++;
    totalConfidence += alert.confidence;
    totalFRP += alert.frp;
  }

  return {
    total: alerts.length,
    byDepartment: Object.fromEntries(
      Object.entries(byDepartment).map(([dept, alerts]) => [dept, alerts.length])
    ),
    bySeverity,
    avgConfidence: Math.round(totalConfidence / alerts.length),
    avgFRP: Math.round(totalFRP / alerts.length),
  };
}

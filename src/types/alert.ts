import { DeforestationAlert } from "@prisma/client";

// Alert severity enum (matches Prisma schema)
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH";

// Alert status enum (matches Prisma schema)
export type AlertStatus = "NEW" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";

// Alert with related project
export interface AlertWithProject extends DeforestationAlert {
  nearProject: {
    id: string;
    name: string;
    type: string;
    status: string;
  } | null;
}

// Alert list item (for table display)
export interface AlertListItem {
  id: string;
  latitude: number;
  longitude: number;
  detectedAt: Date;
  department: string;
  municipality: string | null;
  severity: AlertSeverity;
  status: AlertStatus;
  confidence: number | null;
  brightness: number | null;
  nearProjectId: string | null;
  nearProjectDistance: number | null;
  nearProject: {
    id: string;
    name: string;
  } | null;
  notes: string | null;
  createdAt: Date;
}

// Alert detail (for detail view)
export interface AlertDetail extends DeforestationAlert {
  nearProject: {
    id: string;
    name: string;
    type: string;
    status: string;
    areaHectares: number;
    estimatedCo2TonsYear: number | null;
  } | null;
  geeAnalysis?: {
    forestLossProbability: number;
    estimatedAreaHectares: number;
    ndviChange: number;
  } | null;
}

// Update alert status input
export interface UpdateAlertStatusInput {
  status: AlertStatus;
  notes?: string;
}

// Alert query filters
export interface AlertQueryFilters {
  department?: string;
  municipality?: string;
  severity?: AlertSeverity;
  status?: AlertStatus;
  dateFrom?: Date;
  dateTo?: Date;
  hasNearProject?: boolean;
  page?: number;
  limit?: number;
}

// Alert statistics
export interface AlertStatistics {
  total: number;
  byStatus: {
    status: AlertStatus;
    count: number;
  }[];
  bySeverity: {
    severity: AlertSeverity;
    count: number;
  }[];
  byDepartment: {
    department: string;
    count: number;
  }[];
  nearProjects: number;
  recentTrend: {
    current: number;
    previous: number;
    percentChange: number;
  };
}

// NASA FIRMS source data
export interface NASAFIRMSData {
  latitude: number;
  longitude: number;
  brightness: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  instrument: string;
  confidence: number;
  version: string;
  bright_t31: number;
  frp: number;
  daynight: string;
}

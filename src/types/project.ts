/**
 * Project Types
 * Types for carbon offset projects
 */

import { ProjectType, ProjectStatus, Project, Organization, ProjectDocument, CarbonCredit, ProjectStatusHistory } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Re-export Prisma enums for convenience
export { ProjectType, ProjectStatus };

/**
 * Project with all relations
 */
export interface ProjectWithRelations extends Project {
  organization: Organization;
  documents: ProjectDocument[];
  carbonCredits: CarbonCredit[];
  statusHistory: ProjectStatusHistory[];
}

/**
 * Project list item (for tables/grids)
 */
export interface ProjectListItem {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  department: string;
  municipality: string | null;
  areaHectares: Decimal;
  estimatedCo2TonsYear: Decimal | null;
  forestCoveragePercent: Decimal | null;
  geeVerified: boolean;
  organizationId: string;
  organizationName: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new project
 */
export interface CreateProjectInput {
  name: string;
  type: ProjectType;
  description?: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  department: string;
  municipality?: string;
  organizationId: string;
  communities?: string;
  coBenefits?: string[];
  startDate?: Date;
  durationYears?: number;
  createdBy?: string;
}

/**
 * Input for updating a project
 */
export interface UpdateProjectInput {
  name?: string;
  type?: ProjectType;
  description?: string;
  geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  department?: string;
  municipality?: string;
  organizationId?: string;
  communities?: string;
  coBenefits?: string[];
  startDate?: Date;
  durationYears?: number;
}

/**
 * Query filters for listing projects
 */
export interface ProjectQueryFilters {
  department?: string;
  type?: ProjectType;
  status?: ProjectStatus;
  organizationId?: string;
  search?: string; // Search by name
  dateFrom?: Date;
  dateTo?: Date;
  geeVerified?: boolean;
}

/**
 * Project statistics
 */
export interface ProjectStats {
  totalProjects: number;
  totalHectares: number;
  totalCo2TonsYear: number;
  byStatus: Record<ProjectStatus, number>;
  byType: Record<ProjectType, number>;
  byDepartment: Record<string, number>;
}

/**
 * Project creation response (includes GEE analysis)
 */
export interface ProjectCreationResponse {
  project: Project;
  geeAnalysis: {
    forestCoveragePercent: number;
    biomassPerHectare: number;
    forestType: string;
    verified: boolean;
    confidence: number;
  };
  carbonEstimate: {
    estimatedCo2TonsYear: number;
    revenueEstimate: {
      conservative: number;
      realistic: number;
      optimistic: number;
    };
  };
}

/**
 * Project detail view
 */
export interface ProjectDetailView extends ProjectWithRelations {
  recentAlerts?: Array<{
    id: string;
    latitude: Decimal;
    longitude: Decimal;
    severity: string;
    detectedAt: Date;
    distance: Decimal;
  }>;
  carbonCreditsTotal?: Decimal;
  documentsCount?: number;
}

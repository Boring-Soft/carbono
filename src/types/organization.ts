/**
 * Organization Types
 * Types for organization management
 */

export type OrganizationType = "Community" | "NGO" | "Government" | "Private";

/**
 * Base organization data
 */
export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Organization with project count and metrics
 */
export interface OrganizationWithMetrics extends Organization {
  _count: {
    projects: number;
  };
  metrics: {
    totalProjects: number;
    totalHectares: number;
    totalCo2Year: number;
    activeProjects: number;
    certifiedProjects: number;
  };
}

/**
 * Organization with full project details
 */
export interface OrganizationWithProjects extends Organization {
  projects: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    areaHectares: number;
    estimatedCo2TonsYear: number | null;
    department: string;
    createdAt: Date;
  }>;
  _count: {
    projects: number;
  };
  metrics: {
    totalProjects: number;
    totalHectares: number;
    totalCo2Year: number;
    activeProjects: number;
    certifiedProjects: number;
  };
}

/**
 * Input for creating a new organization
 */
export interface CreateOrganizationInput {
  name: string;
  type: OrganizationType;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
}

/**
 * Input for updating an existing organization
 */
export interface UpdateOrganizationInput {
  name?: string;
  type?: OrganizationType;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
}

/**
 * Organization list item (for tables and grids)
 */
export interface OrganizationListItem {
  id: string;
  name: string;
  type: OrganizationType;
  contactEmail: string | null;
  contactPhone: string | null;
  totalProjects: number;
  totalHectares: number;
  totalCo2Year: number;
  createdAt: Date;
}

/**
 * Organization query filters
 */
export interface OrganizationQueryFilters {
  search?: string;
  type?: OrganizationType;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'totalProjects' | 'totalHectares';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Organization type labels (Spanish)
 */
export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  Community: 'Comunidad Indigena',
  NGO: 'ONG',
  Government: 'Gobierno',
  Private: 'Privado',
};

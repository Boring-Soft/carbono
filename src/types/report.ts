export type ReportType =
  | "NATIONAL"
  | "DEPARTMENT"
  | "PROJECT"
  | "MONTHLY"
  | "ANNUAL";

export type ReportFormat = "PDF" | "EXCEL";

export interface ReportParameters {
  type: ReportType;
  format: ReportFormat;
  // For department reports
  department?: string;
  // For project reports
  projectId?: string;
  // For monthly/annual reports
  month?: number;
  year?: number;
  // Date range for custom reports
  dateFrom?: Date;
  dateTo?: Date;
}

export interface NationalReportData {
  summary: {
    totalProjects: number;
    totalHectares: number;
    totalCo2Year: number;
    revenuePotential: number;
    projectsByStatus: {
      status: string;
      count: number;
    }[];
    projectsByType: {
      type: string;
      count: number;
    }[];
  };
  departmentBreakdown: {
    department: string;
    projectCount: number;
    hectares: number;
    co2TonsYear: number;
  }[];
  topProjects: {
    id: string;
    name: string;
    type: string;
    department: string;
    areaHectares: number;
    estimatedCo2TonsYear: number;
  }[];
  recentAlerts: {
    total: number;
    high: number;
    nearProjects: number;
  };
}

export interface DepartmentReportData {
  department: string;
  summary: {
    totalProjects: number;
    totalHectares: number;
    totalCo2Year: number;
    projectsByType: {
      type: string;
      count: number;
    }[];
  };
  projects: {
    id: string;
    name: string;
    type: string;
    status: string;
    municipality: string | null;
    areaHectares: number;
    estimatedCo2TonsYear: number | null;
    startDate: Date | null;
  }[];
  alerts: {
    total: number;
    byMunicipality: {
      municipality: string;
      count: number;
    }[];
  };
}

export interface ProjectReportData {
  project: {
    id: string;
    name: string;
    type: string;
    status: string;
    description: string | null;
    department: string;
    municipality: string | null;
    areaHectares: number;
    estimatedCo2TonsYear: number | null;
    forestCoveragePercent: number | null;
    geeVerified: boolean;
    startDate: Date | null;
    durationYears: number | null;
    createdAt: Date;
    organization: {
      name: string;
      type: string;
    };
  };
  carbonMetrics: {
    annualCapture: number;
    projectedCapture10Years: number;
    revenueEstimates: {
      conservative: number;
      realistic: number;
      optimistic: number;
    };
  };
  statusHistory: {
    fromStatus: string | null;
    toStatus: string;
    notes: string | null;
    createdAt: Date;
  }[];
  documents: {
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: Date;
  }[];
  nearbyAlerts: {
    count: number;
    highSeverity: number;
  };
}

export interface MonthlyReportData {
  month: number;
  year: number;
  period: string;
  newProjects: {
    count: number;
    projects: {
      id: string;
      name: string;
      type: string;
      department: string;
      areaHectares: number;
    }[];
  };
  statusChanges: {
    count: number;
    changes: {
      projectName: string;
      fromStatus: string;
      toStatus: string;
      date: Date;
    }[];
  };
  alerts: {
    total: number;
    byDepartment: {
      department: string;
      count: number;
    }[];
    bySeverity: {
      severity: string;
      count: number;
    }[];
  };
  summary: {
    totalProjects: number;
    totalHectares: number;
    totalCo2Year: number;
  };
}

export interface ReportMetadata {
  generatedAt: Date;
  generatedBy?: string;
  reportType: ReportType;
  parameters: ReportParameters;
}

export interface GeneratedReport {
  metadata: ReportMetadata;
  data: NationalReportData | DepartmentReportData | ProjectReportData | MonthlyReportData;
  buffer?: Buffer; // For file downloads
  fileName: string;
}

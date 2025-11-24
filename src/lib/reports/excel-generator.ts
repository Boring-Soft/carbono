import * as XLSX from "xlsx";
import {
  NationalReportData,
  DepartmentReportData,
  ProjectReportData,
  MonthlyReportData,
} from "@/types/report";

export async function generateNationalExcel(
  data: NationalReportData
): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ["REPORTE NACIONAL - CARBONO BOLIVIA"],
    [""],
    ["Resumen"],
    ["Total de Proyectos", data.summary.totalProjects],
    [
      "Hectáreas Protegidas",
      data.summary.totalHectares,
    ],
    ["Captura Anual CO₂ (t/año)", data.summary.totalCo2Year],
    ["Potencial de Ingresos (USD/año)", data.summary.revenuePotential],
    [""],
    ["Proyectos por Estado"],
    ["Estado", "Cantidad"],
    ...data.summary.projectsByStatus.map((item) => [item.status, item.count]),
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");

  // Sheet 2: Department Breakdown
  const deptData = [
    ["Desglose por Departamento"],
    [""],
    ["Departamento", "Proyectos", "Hectáreas", "tCO₂/año"],
    ...data.departmentBreakdown.map((dept) => [
      dept.department,
      dept.projectCount,
      dept.hectares,
      dept.co2TonsYear,
    ]),
  ];

  const deptSheet = XLSX.utils.aoa_to_sheet(deptData);
  XLSX.utils.book_append_sheet(workbook, deptSheet, "Departamentos");

  // Sheet 3: Top Projects
  const projectsData = [
    ["Proyectos Destacados"],
    [""],
    ["ID", "Nombre", "Tipo", "Departamento", "Hectáreas", "tCO₂/año"],
    ...data.topProjects.map((project) => [
      project.id,
      project.name,
      project.type,
      project.department,
      project.areaHectares,
      project.estimatedCo2TonsYear,
    ]),
  ];

  const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData);
  XLSX.utils.book_append_sheet(workbook, projectsSheet, "Proyectos");

  // Sheet 4: Alerts
  const alertsData = [
    ["Alertas de Deforestación"],
    [""],
    ["Total de Alertas", data.recentAlerts.total],
    ["Alertas de Alta Severidad", data.recentAlerts.high],
    ["Alertas Cerca de Proyectos", data.recentAlerts.nearProjects],
  ];

  const alertsSheet = XLSX.utils.aoa_to_sheet(alertsData);
  XLSX.utils.book_append_sheet(workbook, alertsSheet, "Alertas");

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return Buffer.from(excelBuffer);
}

export async function generateDepartmentExcel(
  department: string,
  data: DepartmentReportData
): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    [`REPORTE DEPARTAMENTAL - ${department.toUpperCase()}`],
    [""],
    ["Resumen"],
    ["Total de Proyectos", data.summary.totalProjects],
    ["Hectáreas Protegidas", data.summary.totalHectares],
    ["Captura Anual CO₂ (t/año)", data.summary.totalCo2Year],
    [""],
    ["Proyectos por Tipo"],
    ["Tipo", "Cantidad"],
    ...data.summary.projectsByType.map((item) => [item.type, item.count]),
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");

  // Sheet 2: Projects
  const projectsData = [
    ["Lista de Proyectos"],
    [""],
    [
      "ID",
      "Nombre",
      "Tipo",
      "Estado",
      "Municipio",
      "Hectáreas",
      "tCO₂/año",
      "Fecha Inicio",
    ],
    ...data.projects.map((project) => [
      project.id,
      project.name,
      project.type,
      project.status,
      project.municipality || "",
      project.areaHectares,
      project.estimatedCo2TonsYear || 0,
      project.startDate
        ? new Date(project.startDate).toLocaleDateString("es-BO")
        : "",
    ]),
  ];

  const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData);
  XLSX.utils.book_append_sheet(workbook, projectsSheet, "Proyectos");

  // Sheet 3: Alerts
  const alertsData = [
    ["Alertas de Deforestación"],
    [""],
    ["Total de Alertas", data.alerts.total],
    [""],
    ["Alertas por Municipio"],
    ["Municipio", "Cantidad"],
    ...data.alerts.byMunicipality.map((item) => [
      item.municipality,
      item.count,
    ]),
  ];

  const alertsSheet = XLSX.utils.aoa_to_sheet(alertsData);
  XLSX.utils.book_append_sheet(workbook, alertsSheet, "Alertas");

  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return Buffer.from(excelBuffer);
}

export async function generateProjectExcel(
  data: ProjectReportData
): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Project Info
  const infoData = [
    ["REPORTE DE PROYECTO"],
    [""],
    ["Información General"],
    ["ID", data.project.id],
    ["Nombre", data.project.name],
    ["Tipo", data.project.type],
    ["Estado", data.project.status],
    ["Organización", data.project.organization.name],
    ["Departamento", data.project.department],
    ["Municipio", data.project.municipality || ""],
    ["Área (ha)", data.project.areaHectares],
    ["Captura Anual CO₂ (t/año)", data.project.estimatedCo2TonsYear || 0],
    [
      "Cobertura Forestal (%)",
      data.project.forestCoveragePercent?.toFixed(1) || "N/A",
    ],
    ["Verificado GEE", data.project.geeVerified ? "Sí" : "No"],
    ["Duración (años)", data.project.durationYears || ""],
    [""],
    ["Métricas de Carbono"],
    ["Captura Anual", data.carbonMetrics.annualCapture],
    [
      "Captura Proyectada (10 años)",
      data.carbonMetrics.projectedCapture10Years,
    ],
    [""],
    ["Estimación de Ingresos"],
    ["Conservador (USD)", data.carbonMetrics.revenueEstimates.conservative],
    ["Realista (USD)", data.carbonMetrics.revenueEstimates.realistic],
    ["Optimista (USD)", data.carbonMetrics.revenueEstimates.optimistic],
  ];

  const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
  XLSX.utils.book_append_sheet(workbook, infoSheet, "Información");

  // Sheet 2: Status History
  const historyData = [
    ["Historial de Estados"],
    [""],
    ["Estado Anterior", "Estado Nuevo", "Notas", "Fecha"],
    ...data.statusHistory.map((item) => [
      item.fromStatus || "Nuevo",
      item.toStatus,
      item.notes || "",
      new Date(item.createdAt).toLocaleDateString("es-BO"),
    ]),
  ];

  const historySheet = XLSX.utils.aoa_to_sheet(historyData);
  XLSX.utils.book_append_sheet(workbook, historySheet, "Historial");

  // Sheet 3: Documents
  const docsData = [
    ["Documentos del Proyecto"],
    [""],
    ["Nombre", "Tipo", "Tamaño (KB)", "Fecha de Carga"],
    ...data.documents.map((doc) => [
      doc.fileName,
      doc.fileType,
      (doc.fileSize / 1024).toFixed(1),
      new Date(doc.uploadedAt).toLocaleDateString("es-BO"),
    ]),
  ];

  const docsSheet = XLSX.utils.aoa_to_sheet(docsData);
  XLSX.utils.book_append_sheet(workbook, docsSheet, "Documentos");

  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return Buffer.from(excelBuffer);
}

export async function generateMonthlyExcel(
  data: MonthlyReportData
): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    [`REPORTE MENSUAL - ${data.period.toUpperCase()}`],
    [""],
    ["Resumen"],
    ["Nuevos Proyectos", data.newProjects.count],
    ["Cambios de Estado", data.statusChanges.count],
    ["Alertas Detectadas", data.alerts.total],
    [""],
    ["Totales Acumulados"],
    ["Total de Proyectos", data.summary.totalProjects],
    ["Total Hectáreas", data.summary.totalHectares],
    ["Total tCO₂/año", data.summary.totalCo2Year],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");

  // Sheet 2: New Projects
  const newProjectsData = [
    ["Nuevos Proyectos del Mes"],
    [""],
    ["ID", "Nombre", "Tipo", "Departamento", "Hectáreas"],
    ...data.newProjects.projects.map((project) => [
      project.id,
      project.name,
      project.type,
      project.department,
      project.areaHectares,
    ]),
  ];

  const newProjectsSheet = XLSX.utils.aoa_to_sheet(newProjectsData);
  XLSX.utils.book_append_sheet(workbook, newProjectsSheet, "Nuevos Proyectos");

  // Sheet 3: Status Changes
  const changesData = [
    ["Cambios de Estado del Mes"],
    [""],
    ["Proyecto", "Estado Anterior", "Estado Nuevo", "Fecha"],
    ...data.statusChanges.changes.map((change) => [
      change.projectName,
      change.fromStatus,
      change.toStatus,
      new Date(change.date).toLocaleDateString("es-BO"),
    ]),
  ];

  const changesSheet = XLSX.utils.aoa_to_sheet(changesData);
  XLSX.utils.book_append_sheet(workbook, changesSheet, "Cambios de Estado");

  // Sheet 4: Alerts
  const alertsData = [
    ["Alertas del Mes"],
    [""],
    ["Total de Alertas", data.alerts.total],
    [""],
    ["Por Departamento"],
    ["Departamento", "Cantidad"],
    ...data.alerts.byDepartment.map((item) => [item.department, item.count]),
    [""],
    ["Por Severidad"],
    ["Severidad", "Cantidad"],
    ...data.alerts.bySeverity.map((item) => [item.severity, item.count]),
  ];

  const alertsSheet = XLSX.utils.aoa_to_sheet(alertsData);
  XLSX.utils.book_append_sheet(workbook, alertsSheet, "Alertas");

  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return Buffer.from(excelBuffer);
}

import jsPDF from "jspdf";
import {
  NationalReportData,
  DepartmentReportData,
  ProjectReportData,
  MonthlyReportData,
  ReportMetadata,
} from "@/types/report";

// Helper to add header and footer
function addHeaderFooter(doc: jsPDF, pageNumber: number, title: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("CARBONO - Plataforma Nacional de Monitoreo", 20, 15);
  doc.text(title, pageWidth - 20, 15, { align: "right" });
  doc.line(20, 18, pageWidth - 20, 18);

  // Footer
  doc.setFontSize(8);
  doc.text(
    `Página ${pageNumber} | Generado: ${new Date().toLocaleDateString("es-BO")}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );
}

export async function generateNationalReport(
  data: NationalReportData,
  metadata: ReportMetadata
): Promise<Buffer> {
  const doc = new jsPDF();
  let yPos = 30;

  // Cover page
  doc.setFontSize(24);
  doc.setTextColor(34, 197, 94); // green-600
  doc.text("REPORTE NACIONAL", 105, 60, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("Proyectos de Carbono en Bolivia", 105, 75, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(
    `Generado: ${metadata.generatedAt.toLocaleDateString("es-BO")}`,
    105,
    90,
    { align: "center" }
  );

  // Summary section
  doc.addPage();
  addHeaderFooter(doc, 2, "Reporte Nacional");
  yPos = 30;

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("Resumen Ejecutivo", 20, yPos);
  yPos += 15;

  doc.setFontSize(11);
  doc.text(`Total de Proyectos: ${data.summary.totalProjects}`, 30, yPos);
  yPos += 8;
  doc.text(
    `Hectáreas Protegidas: ${data.summary.totalHectares.toLocaleString("es-BO")} ha`,
    30,
    yPos
  );
  yPos += 8;
  doc.text(
    `Captura Anual CO₂: ${data.summary.totalCo2Year.toLocaleString("es-BO")} tCO₂/año`,
    30,
    yPos
  );
  yPos += 8;
  doc.text(
    `Potencial de Ingresos: $${data.summary.revenuePotential.toLocaleString("es-BO")} USD/año`,
    30,
    yPos
  );
  yPos += 15;

  // Projects by status
  doc.setFontSize(14);
  doc.text("Proyectos por Estado", 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  data.summary.projectsByStatus.forEach((item) => {
    doc.text(`• ${item.status}: ${item.count}`, 30, yPos);
    yPos += 6;
  });
  yPos += 10;

  // Department breakdown
  doc.setFontSize(14);
  doc.text("Desglose por Departamento", 20, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.text("Departamento", 30, yPos);
  doc.text("Proyectos", 90, yPos);
  doc.text("Hectáreas", 130, yPos);
  doc.text("tCO₂/año", 170, yPos);
  yPos += 6;

  doc.setFontSize(10);
  data.departmentBreakdown.forEach((dept) => {
    if (yPos > 270) {
      doc.addPage();
      addHeaderFooter(doc, doc.getCurrentPageInfo().pageNumber, "Reporte Nacional");
      yPos = 30;
    }

    doc.text(dept.department, 30, yPos);
    doc.text(dept.projectCount.toString(), 90, yPos);
    doc.text(dept.hectares.toLocaleString("es-BO"), 130, yPos);
    doc.text(dept.co2TonsYear.toLocaleString("es-BO"), 170, yPos);
    yPos += 6;
  });

  // Disclaimer
  doc.addPage();
  addHeaderFooter(doc, doc.getCurrentPageInfo().pageNumber, "Reporte Nacional");
  yPos = 30;

  doc.setFontSize(12);
  doc.text("Disclaimer", 20, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.setTextColor(100);
  const disclaimer =
    "Este reporte contiene información pública de proyectos certificados de carbono en Bolivia. " +
    "Los datos son verificados mediante tecnología satelital (Google Earth Engine) y son actualizados " +
    "periódicamente. Para más información, visite la plataforma CARBONO.";

  const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
  doc.text(splitDisclaimer, 20, yPos);

  return Buffer.from(doc.output("arraybuffer"));
}

export async function generateDepartmentReport(
  department: string,
  data: DepartmentReportData,
  metadata: ReportMetadata
): Promise<Buffer> {
  const doc = new jsPDF();
  let yPos = 30;

  // Cover page
  doc.setFontSize(24);
  doc.setTextColor(34, 197, 94);
  doc.text(`REPORTE DEPARTAMENTAL`, 105, 60, { align: "center" });

  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text(department, 105, 80, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(
    `Generado: ${metadata.generatedAt.toLocaleDateString("es-BO")}`,
    105,
    95,
    { align: "center" }
  );

  // Summary
  doc.addPage();
  addHeaderFooter(doc, 2, `Departamento: ${department}`);
  yPos = 30;

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("Resumen", 20, yPos);
  yPos += 15;

  doc.setFontSize(11);
  doc.text(`Total de Proyectos: ${data.summary.totalProjects}`, 30, yPos);
  yPos += 8;
  doc.text(
    `Hectáreas Protegidas: ${data.summary.totalHectares.toLocaleString("es-BO")} ha`,
    30,
    yPos
  );
  yPos += 8;
  doc.text(
    `Captura Anual CO₂: ${data.summary.totalCo2Year.toLocaleString("es-BO")} tCO₂/año`,
    30,
    yPos
  );
  yPos += 15;

  // Projects list
  doc.setFontSize(14);
  doc.text("Lista de Proyectos", 20, yPos);
  yPos += 10;

  data.projects.forEach((project, index) => {
    if (yPos > 260) {
      doc.addPage();
      addHeaderFooter(doc, doc.getCurrentPageInfo().pageNumber, `Departamento: ${department}`);
      yPos = 30;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${project.name}`, 30, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Tipo: ${project.type} | Estado: ${project.status}`, 35, yPos);
    yPos += 5;
    doc.text(
      `Área: ${project.areaHectares.toLocaleString("es-BO")} ha | CO₂: ${
        project.estimatedCo2TonsYear
          ? project.estimatedCo2TonsYear.toLocaleString("es-BO")
          : "N/A"
      } t/año`,
      35,
      yPos
    );
    yPos += 10;
  });

  return Buffer.from(doc.output("arraybuffer"));
}

export async function generateProjectReport(
  data: ProjectReportData,
  metadata: ReportMetadata
): Promise<Buffer> {
  // metadata parameter is kept for API consistency but not currently used in the report body
  void metadata;
  const doc = new jsPDF();
  let yPos = 30;

  // Cover page
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94);
  doc.text("REPORTE DE PROYECTO", 105, 60, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(data.project.name, 105, 80, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(
    `${data.project.department} | ${data.project.type}`,
    105,
    95,
    { align: "center" }
  );

  // Project details
  doc.addPage();
  addHeaderFooter(doc, 2, "Reporte de Proyecto");
  yPos = 30;

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("Información del Proyecto", 20, yPos);
  yPos += 12;

  doc.setFontSize(10);
  doc.text(`Organización: ${data.project.organization.name}`, 30, yPos);
  yPos += 7;
  doc.text(`Estado: ${data.project.status}`, 30, yPos);
  yPos += 7;
  doc.text(
    `Área: ${data.project.areaHectares.toLocaleString("es-BO")} hectáreas`,
    30,
    yPos
  );
  yPos += 7;
  doc.text(
    `Captura Anual: ${
      data.project.estimatedCo2TonsYear
        ? data.project.estimatedCo2TonsYear.toLocaleString("es-BO")
        : "N/A"
    } tCO₂/año`,
    30,
    yPos
  );
  yPos += 7;

  if (data.project.forestCoveragePercent) {
    doc.text(
      `Cobertura Forestal: ${data.project.forestCoveragePercent.toFixed(1)}%`,
      30,
      yPos
    );
    yPos += 7;
  }

  // Carbon metrics
  yPos += 5;
  doc.setFontSize(14);
  doc.text("Métricas de Carbono", 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.text(
    `Captura Proyectada (10 años): ${data.carbonMetrics.projectedCapture10Years.toLocaleString("es-BO")} tCO₂`,
    30,
    yPos
  );
  yPos += 7;
  doc.text("Estimación de Ingresos:", 30, yPos);
  yPos += 6;
  doc.text(
    `  Conservador: $${data.carbonMetrics.revenueEstimates.conservative.toLocaleString("es-BO")}`,
    35,
    yPos
  );
  yPos += 6;
  doc.text(
    `  Realista: $${data.carbonMetrics.revenueEstimates.realistic.toLocaleString("es-BO")}`,
    35,
    yPos
  );
  yPos += 6;
  doc.text(
    `  Optimista: $${data.carbonMetrics.revenueEstimates.optimistic.toLocaleString("es-BO")}`,
    35,
    yPos
  );

  return Buffer.from(doc.output("arraybuffer"));
}

export async function generateMonthlyReport(
  data: MonthlyReportData,
  metadata: ReportMetadata
): Promise<Buffer> {
  // metadata parameter is kept for API consistency but not currently used in the report body
  void metadata;
  const doc = new jsPDF();
  let yPos = 30;

  // Cover page
  doc.setFontSize(24);
  doc.setTextColor(34, 197, 94);
  doc.text("REPORTE MENSUAL", 105, 60, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(data.period, 105, 80, { align: "center" });

  // Summary
  doc.addPage();
  addHeaderFooter(doc, 2, `Reporte Mensual - ${data.period}`);
  yPos = 30;

  doc.setFontSize(16);
  doc.text("Resumen del Mes", 20, yPos);
  yPos += 12;

  doc.setFontSize(11);
  doc.text(`Nuevos Proyectos: ${data.newProjects.count}`, 30, yPos);
  yPos += 7;
  doc.text(`Cambios de Estado: ${data.statusChanges.count}`, 30, yPos);
  yPos += 7;
  doc.text(`Alertas Detectadas: ${data.alerts.total}`, 30, yPos);
  yPos += 15;

  // New projects
  if (data.newProjects.count > 0) {
    doc.setFontSize(14);
    doc.text("Nuevos Proyectos", 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    data.newProjects.projects.forEach((project) => {
      if (yPos > 270) {
        doc.addPage();
        addHeaderFooter(doc, doc.getCurrentPageInfo().pageNumber, `Reporte Mensual - ${data.period}`);
        yPos = 30;
      }

      doc.text(`• ${project.name} (${project.department})`, 30, yPos);
      yPos += 6;
    });
  }

  return Buffer.from(doc.output("arraybuffer"));
}

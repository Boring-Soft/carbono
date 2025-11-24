"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectStatus, ProjectType } from "@prisma/client";
import { GEEAnalysisBadge } from "./gee-analysis-badge";
import { StatusChangeDialog } from "./status-change-dialog";
import { DocumentUpload } from "./document-upload";
import {
  MapPin,
  Leaf,
  FileText,
  History,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { formatUSDCompact } from "@/lib/carbon/market-prices";

interface ProjectDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: Date;
}

interface CarbonCredit {
  id: string;
  projectId: string;
  tonsCo2: number;
  verificationDate: Date | null;
  certificationBody: string | null;
  status: string;
  pricePerTon: number | null;
  createdAt: Date;
}

interface StatusHistoryEntry {
  id: string;
  fromStatus: ProjectStatus | null;
  toStatus: ProjectStatus;
  notes: string | null;
  createdAt: Date;
}

interface Alert {
  id: string;
  severity: string;
  detectedAt: Date;
  nearProjectDistance?: number;
}

interface Project {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string | null;
  department: string;
  municipality: string | null;
  areaHectares: number;
  estimatedCo2TonsYear: number | null;
  forestCoveragePercent: number | null;
  geeVerified: boolean;
  geeLastCheck: Date | null;
  communities: string | null;
  coBenefits: string | null;
  startDate: Date | null;
  durationYears: number | null;
  createdAt: Date;
  updatedAt: Date;
  organization: {
    id: string;
    name: string;
    type: string;
  };
  documents: ProjectDocument[];
  carbonCredits: CarbonCredit[];
  statusHistory: StatusHistoryEntry[];
  recentAlerts?: Alert[];
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  CERTIFIED: "Certificado",
  ACTIVE: "Activo",
};

const TYPE_LABELS: Record<ProjectType, string> = {
  REDD_PLUS: "REDD+",
  REFORESTATION: "Reforestación",
  RENEWABLE_ENERGY: "Energía Renovable",
  REGENERATIVE_AGRICULTURE: "Agricultura Regenerativa",
  COMMUNITY_CONSERVATION: "Conservación Comunitaria",
};

interface ProjectDetailViewProps {
  project: Project;
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const handleStatusChanged = () => {
    // In a real app, you'd refetch the project data here
    window.location.reload();
  };

  const coBenefits = project.coBenefits ? JSON.parse(project.coBenefits) : [];

  return (
    <>
      <div className="grid gap-6">
        {/* Header Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className="text-sm">
                {STATUS_LABELS[project.status]}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => setIsStatusDialogOpen(true)}
              >
                Cambiar Estado
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Área</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.areaHectares.toLocaleString("es-BO", {
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">hectáreas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Anual</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.estimatedCo2TonsYear
                  ? project.estimatedCo2TonsYear.toLocaleString("es-BO", {
                      maximumFractionDigits: 0,
                    })
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">tCO₂/año</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Info General</TabsTrigger>
            <TabsTrigger value="documents">
              Documentos ({project.documents.length})
            </TabsTrigger>
            <TabsTrigger value="gee">Análisis GEE</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            {project.recentAlerts && project.recentAlerts.length > 0 && (
              <TabsTrigger value="alerts" className="text-destructive">
                Alertas ({project.recentAlerts.length})
              </TabsTrigger>
            )}
          </TabsList>

          {/* Info General */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información del Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Tipo de Proyecto
                    </div>
                    <div className="mt-1 font-medium">
                      {TYPE_LABELS[project.type]}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Organización
                    </div>
                    <div className="mt-1 font-medium">
                      {project.organization.name}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Departamento
                    </div>
                    <div className="mt-1 font-medium">{project.department}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Municipio
                    </div>
                    <div className="mt-1 font-medium">
                      {project.municipality || "-"}
                    </div>
                  </div>

                  {project.startDate && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Fecha de Inicio
                      </div>
                      <div className="mt-1 font-medium">
                        {new Date(project.startDate).toLocaleDateString("es-BO")}
                      </div>
                    </div>
                  )}

                  {project.durationYears && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Duración
                      </div>
                      <div className="mt-1 font-medium">
                        {project.durationYears} años
                      </div>
                    </div>
                  )}
                </div>

                {project.description && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Descripción
                    </div>
                    <p className="text-sm">{project.description}</p>
                  </div>
                )}

                {project.communities && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Comunidades Beneficiadas
                    </div>
                    <p className="text-sm">{project.communities}</p>
                  </div>
                )}

                {coBenefits.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Co-Beneficios
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {coBenefits.map((benefit: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Carbon Calculation Details */}
            {project.estimatedCo2TonsYear && (
              <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-green-600" />
                    <CardTitle className="text-2xl">Captura de Carbono</CardTitle>
                  </div>
                  <CardDescription>
                    Cálculo estimado basado en metodología IPCC
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main CO2 Value */}
                  <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-lg border-2 border-green-200 dark:border-green-800">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Captura Anual de CO₂
                    </div>
                    <div className="text-5xl font-bold text-green-700 dark:text-green-500">
                      {project.estimatedCo2TonsYear.toLocaleString("es-BO", {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-lg font-medium text-muted-foreground mt-2">
                      toneladas de CO₂ por año
                    </div>
                  </div>

                  {/* Methodology */}
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-green-800 dark:text-green-400">
                      📊 Metodología de Cálculo
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 text-sm">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-md border">
                        <span className="font-medium">Área del proyecto:</span>{" "}
                        {project.areaHectares.toLocaleString("es-BO", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        ha
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-md border">
                        <span className="font-medium">Tipo de proyecto:</span>{" "}
                        {TYPE_LABELS[project.type]}
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-md border text-sm">
                      <div className="font-medium mb-1">Fuente de datos:</div>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>
                          <strong>Factores IPCC</strong> (Intergovernmental Panel on Climate
                          Change) - Estándares internacionales de biomasa forestal
                        </li>
                        <li>
                          <strong>Tasas de secuestro</strong> según tipo de ecosistema boliviano
                          (Amazonía, Chiquitanía, Yungas, Altiplano)
                        </li>
                        <li>
                          <strong>Factor de conversión:</strong> 3.67 tCO₂ por tonelada de
                          carbono (C → CO₂)
                        </li>
                      </ul>
                    </div>
                    {project.geeVerified && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800 text-sm">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                          <span className="font-medium">✓ Verificado con Google Earth Engine</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Cobertura forestal confirmada mediante análisis satelital
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Revenue Estimate */}
            {project.estimatedCo2TonsYear && (
              <Card>
                <CardHeader>
                  <CardTitle>Estimación de Ingresos</CardTitle>
                  <CardDescription>
                    Basado en {project.estimatedCo2TonsYear.toLocaleString("es-BO")} tCO₂/año
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Conservador ($5/tCO₂)</div>
                      <div className="text-2xl font-bold text-green-700">
                        {formatUSDCompact(project.estimatedCo2TonsYear * 5)}/año
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Realista ($15/tCO₂)</div>
                      <div className="text-2xl font-bold text-green-700">
                        {formatUSDCompact(project.estimatedCo2TonsYear * 15)}/año
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Optimista ($50/tCO₂)</div>
                      <div className="text-2xl font-bold text-green-700">
                        {formatUSDCompact(project.estimatedCo2TonsYear * 50)}/año
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subir Documentos</CardTitle>
                <CardDescription>
                  PDFs, imágenes (máx. 5MB por archivo)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUpload projectId={project.id} />
              </CardContent>
            </Card>

            {project.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Documentos ({project.documents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{doc.fileName}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(doc.createdAt).toLocaleDateString("es-BO")} •{" "}
                              {(doc.fileSize / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                            Ver
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* GEE Analysis */}
          <TabsContent value="gee">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Análisis Satelital Google Earth Engine
                  <GEEAnalysisBadge
                    verified={project.geeVerified}
                    forestCoveragePercent={project.forestCoveragePercent}
                    lastCheckDate={project.geeLastCheck}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.geeVerified ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Cobertura Forestal
                        </div>
                        <div className="text-2xl font-bold">
                          {project.forestCoveragePercent ? Number(project.forestCoveragePercent).toFixed(1) : '-'}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Última Verificación
                        </div>
                        <div className="text-sm">
                          {project.geeLastCheck
                            ? new Date(project.geeLastCheck).toLocaleDateString("es-BO")
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Este proyecto aún no ha sido verificado con Google Earth Engine
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Estados</CardTitle>
              </CardHeader>
              <CardContent>
                {project.statusHistory.length > 0 ? (
                  <div className="space-y-3">
                    {project.statusHistory.map((history) => (
                      <div key={history.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <History className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {history.fromStatus && (
                              <>
                                <Badge variant="outline">
                                  {STATUS_LABELS[history.fromStatus]}
                                </Badge>
                                <span className="text-muted-foreground">→</span>
                              </>
                            )}
                            <Badge>{STATUS_LABELS[history.toStatus]}</Badge>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {history.notes}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(history.createdAt).toLocaleString("es-BO")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay historial de cambios
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts */}
          {project.recentAlerts && project.recentAlerts.length > 0 && (
            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Alertas de Deforestación Cercanas
                  </CardTitle>
                  <CardDescription>
                    Últimos 30 días en un radio de 5km
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.recentAlerts.map((alert) => (
                      <div key={alert.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant="destructive">{alert.severity}</Badge>
                            <div className="text-sm text-muted-foreground mt-1">
                              {new Date(alert.detectedAt).toLocaleDateString("es-BO")} •{" "}
                              {alert.nearProjectDistance ? Number(alert.nearProjectDistance).toFixed(2) : 'N/A'} km de distancia
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/alertas/${alert.id}`}>Ver Detalle</a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Status Change Dialog */}
      <StatusChangeDialog
        projectId={project.id}
        projectName={project.name}
        currentStatus={project.status}
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        onStatusChanged={handleStatusChanged}
      />
    </>
  );
}

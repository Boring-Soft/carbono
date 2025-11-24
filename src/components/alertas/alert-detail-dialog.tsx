"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "./severity-badge";
import { AlertDetail } from "@/types/alert";
import { Loader2, MapPin, Calendar, Flame, ExternalLink } from "lucide-react";
import Link from "next/link";

interface AlertDetailDialogProps {
  alertId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertDetailDialog({
  alertId,
  open,
  onOpenChange,
}: AlertDetailDialogProps) {
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !alertId) {
      setAlert(null);
      setError(null);
      return;
    }

    const fetchAlertDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/alerts/${alertId}`);
        if (!response.ok) {
          throw new Error("Error al cargar detalle de alerta");
        }
        const data = await response.json();
        setAlert(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlertDetail();
  }, [alertId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Alerta de Deforestación</DialogTitle>
          <DialogDescription>
            Información completa sobre la alerta detectada
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-destructive">{error}</div>
        )}

        {alert && !isLoading && (
          <div className="space-y-4">
            {/* Main Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Severidad</div>
                    <div className="mt-1">
                      <SeverityBadge severity={alert.severity} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Estado</div>
                    <div className="mt-1 font-medium">{alert.status}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Fecha de Detección
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(alert.detectedAt).toLocaleString("es-BO")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Fuente</div>
                    <div className="mt-1 font-medium">NASA FIRMS</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ubicación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Coordenadas</div>
                    <div className="mt-1 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">
                        {Number(alert.latitude).toFixed(4)}, {Number(alert.longitude).toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Departamento</div>
                    <div className="mt-1 font-medium">{alert.department || 'No especificado'}</div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Ver en Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Detection Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos de Detección</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  {alert.confidence && (
                    <div>
                      <div className="text-sm text-muted-foreground">Confianza</div>
                      <div className="mt-1 font-medium">{alert.confidence}%</div>
                    </div>
                  )}
                  {alert.brightness && (
                    <div>
                      <div className="text-sm text-muted-foreground">Brillo</div>
                      <div className="mt-1 flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{alert.brightness ? Number(alert.brightness) : 'N/A'} K</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Near Project */}
            {alert.nearProject && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Proyecto Cercano</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{alert.nearProject.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {alert.nearProject.type} • {alert.nearProject.status}
                      </div>
                      {alert.nearProjectDistance && (
                        <div className="text-sm text-red-600 font-medium mt-1">
                          A {Number(alert.nearProjectDistance).toFixed(2)} km de distancia
                        </div>
                      )}
                    </div>
                    <Link href={`/proyectos/${alert.nearProject.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Proyecto
                      </Button>
                    </Link>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2 pt-2 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Área</div>
                      <div className="font-medium">
                        {alert.nearProject.areaHectares.toLocaleString("es-BO")} ha
                      </div>
                    </div>
                    {alert.nearProject.estimatedCo2TonsYear && (
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Captura CO₂/año
                        </div>
                        <div className="font-medium text-green-600">
                          {alert.nearProject.estimatedCo2TonsYear.toLocaleString(
                            "es-BO"
                          )}{" "}
                          t
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {alert.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{alert.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

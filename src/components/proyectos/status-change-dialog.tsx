"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "@prisma/client";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StatusChangeDialogProps {
  projectId: string;
  projectName: string;
  currentStatus: ProjectStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChanged?: () => void;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  CERTIFIED: "Certificado",
  ACTIVE: "Activo",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  PENDING: "bg-yellow-500",
  APPROVED: "bg-blue-500",
  CERTIFIED: "bg-green-500",
  ACTIVE: "bg-emerald-500",
};

const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  PENDING: ["APPROVED"],
  APPROVED: ["CERTIFIED", "ACTIVE", "PENDING"],
  CERTIFIED: ["ACTIVE"],
  ACTIVE: ["CERTIFIED"],
};

export function StatusChangeDialog({
  projectId,
  projectName,
  currentStatus,
  open,
  onOpenChange,
  onStatusChanged,
}: StatusChangeDialogProps) {
  const [newStatus, setNewStatus] = useState<ProjectStatus | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableStatuses = VALID_TRANSITIONS[currentStatus] || [];

  const handleSubmit = async () => {
    if (!newStatus) {
      setError("Selecciona un nuevo estado");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al cambiar el estado");
      }

      // Success
      if (onStatusChanged) {
        onStatusChanged();
      }
      onOpenChange(false);
      setNewStatus(null);
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setNewStatus(null);
    setNotes("");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cambiar Estado del Proyecto</DialogTitle>
          <DialogDescription>
            Proyecto: <strong>{projectName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div>
            <Label>Estado Actual</Label>
            <div className="mt-2">
              <Badge className={STATUS_COLORS[currentStatus]}>
                {STATUS_LABELS[currentStatus]}
              </Badge>
            </div>
          </div>

          {/* New Status */}
          <div className="space-y-2">
            <Label htmlFor="new-status">Nuevo Estado *</Label>
            {availableStatuses.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No hay transiciones de estado disponibles desde{" "}
                  {STATUS_LABELS[currentStatus]}
                </AlertDescription>
              </Alert>
            ) : (
              <Select
                value={newStatus || undefined}
                onValueChange={(value) => setNewStatus(value as ProjectStatus)}
              >
                <SelectTrigger id="new-status">
                  <SelectValue placeholder="Selecciona el nuevo estado" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`}
                        />
                        {STATUS_LABELS[status]}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Agrega notas sobre este cambio de estado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Certification notice */}
          {newStatus === "CERTIFIED" && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-sm">
                Al certificar este proyecto, se generará una notificación
                automática a todos los administradores.
              </AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!newStatus || isSubmitting || availableStatuses.length === 0}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Cambio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

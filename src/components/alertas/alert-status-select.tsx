"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { AlertStatus } from "@/types/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const STATUS_LABELS: Record<AlertStatus, string> = {
  NEW: "Nueva",
  INVESTIGATING: "Investigando",
  RESOLVED: "Resuelta",
  DISMISSED: "Descartada",
};

const STATUS_COLORS: Record<AlertStatus, string> = {
  NEW: "bg-blue-500",
  INVESTIGATING: "bg-yellow-500",
  RESOLVED: "bg-green-500",
  DISMISSED: "bg-gray-500",
};

interface AlertStatusSelectProps {
  alertId: string;
  currentStatus: AlertStatus;
  currentNotes?: string | null;
  onStatusChanged?: () => void;
}

export function AlertStatusSelect({
  alertId,
  currentStatus,
  currentNotes,
  onStatusChanged,
}: AlertStatusSelectProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus | null>(null);
  const [notes, setNotes] = useState(currentNotes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as AlertStatus);
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al actualizar estado");
      }

      // Success
      if (onStatusChanged) {
        onStatusChanged();
      }
      setIsDialogOpen(false);
      setSelectedStatus(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedStatus(null);
    setError(null);
  };

  return (
    <>
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[currentStatus]}`} />
              {STATUS_LABELS[currentStatus]}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <SelectItem key={status} value={status}>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[status as AlertStatus]}`} />
                {label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Alerta</DialogTitle>
            <DialogDescription>
              Confirma el cambio de estado y agrega notas adicionales si es necesario
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Status change preview */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${STATUS_COLORS[currentStatus]}`} />
                <span className="text-sm font-medium">{STATUS_LABELS[currentStatus]}</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${selectedStatus ? STATUS_COLORS[selectedStatus] : ""}`} />
                <span className="text-sm font-medium">
                  {selectedStatus ? STATUS_LABELS[selectedStatus] : ""}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Agrega información sobre este cambio de estado..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Info for resolved status */}
            {selectedStatus === "RESOLVED" && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-sm">
                  Al marcar como resuelta, se registrará que la alerta ha sido atendida exitosamente.
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
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Cambio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

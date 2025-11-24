"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, AlertTriangle } from "lucide-react";
import { createOrganizationSchema } from "@/lib/validations/organization";
import { toast } from "sonner";

type FormData = z.infer<typeof createOrganizationSchema>;

type OrganizationType = "Community" | "NGO" | "Government" | "Private";

const TYPE_LABELS: Record<OrganizationType, string> = {
  Community: "Comunidad Indigena",
  NGO: "ONG",
  Government: "Gobierno",
  Private: "Privado",
};

interface CreateOrganizationDialogProps {
  onOrganizationCreated?: (organization: { id: string; name: string }) => void;
  trigger?: React.ReactNode;
}

export function CreateOrganizationDialog({
  onOrganizationCreated,
  trigger,
}: CreateOrganizationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createOrganizationSchema),
  });

  const formData = watch();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          contactEmail: data.contactEmail || null,
          contactPhone: data.contactPhone || null,
          address: data.address || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la organizacion");
      }

      const result = await response.json();
      toast.success("Organizacion creada exitosamente");

      // Reset form and close dialog
      reset();
      setOpen(false);

      // Notify parent component
      if (onOrganizationCreated && result.data) {
        onOrganizationCreated({
          id: result.data.id,
          name: result.data.name,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Organizacion
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Organizacion</DialogTitle>
          <DialogDescription>
            Registra una nueva organizacion para asociarla al proyecto
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Organizacion *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ej: Comunidad Indigena Tsimane"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Organizacion *</Label>
            <Select
              value={formData.type as string | undefined}
              onValueChange={(value) => setValue("type", value as OrganizationType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email de Contacto</Label>
            <Input
              id="contactEmail"
              type="email"
              {...register("contactEmail")}
              placeholder="organizacion@ejemplo.com"
            />
            {errors.contactEmail && (
              <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Telefono de Contacto</Label>
            <Input
              id="contactPhone"
              {...register("contactPhone")}
              placeholder="+591 12345678"
            />
            {errors.contactPhone && (
              <p className="text-sm text-destructive">
                {errors.contactPhone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Direccion</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Direccion completa de la organizacion..."
              rows={2}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Organizacion"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

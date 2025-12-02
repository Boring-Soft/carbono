"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CarbonPreview } from "./carbon-preview";
import { CreateOrganizationDialog } from "../organizaciones/create-organization-dialog";
import { ProjectMapDrawer } from "./project-map-drawer";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { ProjectType } from "@prisma/client";
import { calculatePolygonArea } from "@/lib/geo/turf-utils";

// Validation schema
const projectFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  type: z.nativeEnum(ProjectType),
  organizationId: z.string().min(1, "Selecciona una organización"),
  description: z.string().optional(),
  department: z.string().min(1, "Selecciona un departamento"),
  municipality: z.string().optional(),
  communities: z.string().optional(),
  geometry: z.custom<GeoJSON.Polygon>((val) => val !== null && val !== undefined, "Debes dibujar el área del proyecto"),
  startDate: z.string().optional(),
  durationYears: z.coerce.number().min(1).max(50).optional(),
  coBenefits: z.array(z.string()).optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

const DEPARTAMENTOS = [
  "La Paz",
  "Cochabamba",
  "Santa Cruz",
  "Oruro",
  "Potosí",
  "Chuquisaca",
  "Tarija",
  "Beni",
  "Pando",
];

const CO_BENEFITS = [
  "Biodiversidad",
  "Agua",
  "Suelo",
  "Empleo local",
  "Educación",
  "Salud",
  "Energía renovable",
  "Seguridad alimentaria",
];

const TYPE_LABELS: Record<ProjectType, string> = {
  REDD_PLUS: "REDD+",
  REFORESTATION: "Reforestación",
  RENEWABLE_ENERGY: "Energía Renovable",
  REGENERATIVE_AGRICULTURE: "Agricultura Regenerativa",
  COMMUNITY_CONSERVATION: "Conservación Comunitaria",
};

interface ProjectFormProps {
  organizations: Array<{ id: string; name: string }>;
}

export function ProjectForm({ organizations }: ProjectFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapDrawerOpen, setIsMapDrawerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      coBenefits: [],
    },
  });

  // No longer needed since we're using a modal instead of navigation

  const formData = watch();
  const geometry = watch("geometry");
  const selectedCoBenefits = watch("coBenefits") || [];

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const toggleCoBenefit = (benefit: string) => {
    const current = selectedCoBenefits;
    const updated = current.includes(benefit)
      ? current.filter((b) => b !== benefit)
      : [...current, benefit];
    setValue("coBenefits", updated);
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          organizationId: data.organizationId,
          description: data.description || null,
          department: data.department,
          municipality: data.municipality || null,
          communities: data.communities || null,
          geometry: data.geometry,
          startDate: data.startDate ? new Date(data.startDate) : null,
          durationYears: data.durationYears || null,
          coBenefits: data.coBenefits && data.coBenefits.length > 0 ? data.coBenefits : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el proyecto");
      }

      await response.json();
      toast.success("Proyecto creado exitosamente");
      // Redirect to projects list for now (detail page not implemented yet)
      router.push(`/proyectos`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleOpenMapDrawer = () => {
    setIsMapDrawerOpen(true);
  };

  const handleSaveGeometry = (geometry: GeoJSON.Polygon) => {
    setValue("geometry", geometry);
    setIsMapDrawerOpen(false);
    toast.success("Área guardada correctamente");
  };

  const canProceedFromStep1 = formData.name && formData.type && formData.organizationId;
  const canProceedFromStep2 = formData.department && formData.geometry;

  return (
    <>
      <div className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Paso {step} de {totalSteps}</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Información Básica */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>
                  Datos principales del proyecto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Proyecto *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Ej: Conservación Bosque Amazónico Norte"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Proyecto *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setValue("type", value as ProjectType)}
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="organizationId">Organización *</Label>
                    <CreateOrganizationDialog
                      onOrganizationCreated={(org) => {
                        // Refresh organizations list would be ideal, but for now just show success
                        toast.success(`Organizacion ${org.name} creada. Recarga la pagina para seleccionarla.`);
                      }}
                    />
                  </div>
                  <Select
                    value={formData.organizationId}
                    onValueChange={(value) => setValue("organizationId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la organización" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.organizationId && (
                    <p className="text-sm text-destructive">
                      {errors.organizationId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe el objetivo y alcance del proyecto..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Ubicación y Área */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Ubicación y Área</CardTitle>
                <CardDescription>
                  Define la ubicación geográfica del proyecto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setValue("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTAMENTOS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-sm text-destructive">
                      {errors.department.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipality">Municipio</Label>
                  <Input
                    id="municipality"
                    {...register("municipality")}
                    placeholder="Ej: Rurrenabaque"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="communities">Comunidades Beneficiadas</Label>
                  <Textarea
                    id="communities"
                    {...register("communities")}
                    placeholder="Lista las comunidades que participan o se benefician del proyecto..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Área del Proyecto *</Label>
                  {geometry ? (
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-green-700" />
                            <div>
                              <p className="font-medium text-green-900">Área definida</p>
                              <p className="text-sm text-green-700">
                                {calculatePolygonArea(geometry).toLocaleString("es-BO", {
                                  maximumFractionDigits: 2,
                                })}{" "}
                                hectáreas
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleOpenMapDrawer}
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleOpenMapDrawer}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Dibujar Área en el Mapa
                    </Button>
                  )}
                  {errors.geometry && (
                    <p className="text-sm text-destructive">{errors.geometry.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Detalles del Proyecto */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Proyecto</CardTitle>
                <CardDescription>
                  Información adicional y co-beneficios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register("startDate")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="durationYears">Duración (años)</Label>
                    <Input
                      id="durationYears"
                      type="number"
                      min="1"
                      max="50"
                      {...register("durationYears")}
                      placeholder="Ej: 10"
                    />
                    {errors.durationYears && (
                      <p className="text-sm text-destructive">
                        {errors.durationYears.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Co-Beneficios</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecciona los beneficios adicionales del proyecto
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CO_BENEFITS.map((benefit) => (
                      <Badge
                        key={benefit}
                        variant={
                          selectedCoBenefits.includes(benefit) ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleCoBenefit(benefit)}
                      >
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Revisión y Confirmación */}
          {step === 4 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revisión del Proyecto</CardTitle>
                  <CardDescription>
                    Verifica los datos antes de crear el proyecto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="font-medium">
                        {formData.type && TYPE_LABELS[formData.type]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Departamento</p>
                      <p className="font-medium">{formData.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Área</p>
                      <p className="font-medium">
                        {formData.geometry &&
                          calculatePolygonArea(formData.geometry).toLocaleString(
                            "es-BO",
                            { maximumFractionDigits: 2 }
                          )}{" "}
                        ha
                      </p>
                    </div>
                  </div>

                  {selectedCoBenefits.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Co-Beneficios
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCoBenefits.map((benefit) => (
                          <Badge key={benefit} variant="outline">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Carbon Preview */}
              {formData.geometry && formData.type && (
                <CarbonPreview
                  areaHectares={calculatePolygonArea(formData.geometry)}
                  projectType={formData.type}
                />
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}

            {step < totalSteps && (
              <Button
                type="button"
                onClick={nextStep}
                disabled={
                  (step === 1 && !canProceedFromStep1) ||
                  (step === 2 && !canProceedFromStep2)
                }
                className="ml-auto"
              >
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {step === totalSteps && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Crear Proyecto
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Map Drawer Modal */}
      <ProjectMapDrawer
        open={isMapDrawerOpen}
        onOpenChange={setIsMapDrawerOpen}
        onSave={handleSaveGeometry}
        initialGeometry={geometry}
      />
    </>
  );
}

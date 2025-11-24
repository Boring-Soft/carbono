"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateReportSchema } from "@/lib/validations/report";
import { ReportType, ReportFormat } from "@/types/report";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, FileText, Table2 } from "lucide-react";
import { toast } from "sonner";

type FormValues = {
  type: ReportType;
  format: ReportFormat;
  department?: string;
  projectId?: string;
  month?: number;
  year?: number;
};

const departments = [
  "La Paz",
  "Santa Cruz",
  "Cochabamba",
  "Potosí",
  "Chuquisaca",
  "Oruro",
  "Tarija",
  "Beni",
  "Pando",
];

const reportTypes: { value: ReportType; label: string }[] = [
  { value: "NATIONAL", label: "Reporte Nacional" },
  { value: "DEPARTMENT", label: "Reporte Departamental" },
  { value: "PROJECT", label: "Reporte de Proyecto" },
  { value: "MONTHLY", label: "Reporte Mensual" },
];

const formats: { value: ReportFormat; label: string; icon: any }[] = [
  { value: "PDF", label: "PDF", icon: FileText },
  { value: "EXCEL", label: "Excel", icon: Table2 },
];

export function ReportGeneratorForm({ onGenerated }: { onGenerated?: () => void }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(generateReportSchema),
    defaultValues: {
      type: "NATIONAL",
      format: "PDF",
      year: new Date().getFullYear(),
    },
  });

  const reportType = form.watch("type");

  async function onSubmit(values: FormValues) {
    try {
      setIsGenerating(true);

      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al generar reporte");
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `reporte-${Date.now()}.${values.format.toLowerCase()}`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Reporte generado exitosamente");

      if (onGenerated) {
        onGenerated();
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error instanceof Error ? error.message : "Error al generar reporte");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar Nuevo Reporte</CardTitle>
        <CardDescription>
          Selecciona el tipo de reporte y formato para generar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Report Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Reporte</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Format */}
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formato</FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                      {formats.map((format) => {
                        const Icon = format.icon;
                        return (
                          <button
                            key={format.value}
                            type="button"
                            onClick={() => field.onChange(format.value)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                              field.value === format.value
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-primary/50"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{format.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional Fields */}
            {reportType === "DEPARTMENT" && (
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {reportType === "PROJECT" && (
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID del Proyecto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingresa el ID del proyecto" {...field} />
                    </FormControl>
                    <FormDescription>
                      Puedes encontrar el ID en la lista de proyectos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {reportType === "MONTHLY" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mes</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Mes" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
                            "Enero",
                            "Febrero",
                            "Marzo",
                            "Abril",
                            "Mayo",
                            "Junio",
                            "Julio",
                            "Agosto",
                            "Septiembre",
                            "Octubre",
                            "Noviembre",
                            "Diciembre",
                          ].map((month, index) => (
                            <SelectItem key={index} value={(index + 1).toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Año</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={2020}
                          max={new Date().getFullYear()}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generar Reporte
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

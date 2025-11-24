"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { ProjectType, ProjectStatus } from "@prisma/client";

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

const TYPE_LABELS: Record<ProjectType, string> = {
  REDD_PLUS: "REDD+",
  REFORESTATION: "Reforestación",
  RENEWABLE_ENERGY: "Energía Renovable",
  REGENERATIVE_AGRICULTURE: "Agricultura Regenerativa",
  COMMUNITY_CONSERVATION: "Conservación Comunitaria",
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  CERTIFIED: "Certificado",
  ACTIVE: "Activo",
};

export interface DashboardFilters {
  department?: string;
  dateFrom?: Date;
  dateTo?: Date;
  projectType?: ProjectType;
  status?: ProjectStatus;
}

interface FiltersBarProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export function FiltersBar({ filters, onFiltersChange }: FiltersBarProps) {
  const handleDepartmentChange = (value: string) => {
    onFiltersChange({
      ...filters,
      department: value === "all" ? undefined : value,
    });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      projectType: value === "all" ? undefined : (value as ProjectType),
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === "all" ? undefined : (value as ProjectStatus),
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateFrom: date,
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateTo: date,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.department ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.projectType ||
    filters.status;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filtros</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Department Filter */}
            <div className="space-y-2">
              <Label htmlFor="department" className="text-xs">
                Departamento
              </Label>
              <Select
                value={filters.department || "all"}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger id="department" className="h-9 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {DEPARTAMENTOS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="project-type" className="text-xs">
                Tipo de Proyecto
              </Label>
              <Select
                value={filters.projectType || "all"}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger id="project-type" className="h-9 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-xs">
                Estado
              </Label>
              <Select
                value={filters.status || "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="status" className="h-9 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label className="text-xs">Rango de Fechas</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start text-left font-normal text-sm",
                        !filters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {filters.dateFrom ? (
                        format(filters.dateFrom, "dd/MM/yy", { locale: es })
                      ) : (
                        <span className="text-xs">Desde</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={handleDateFromChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start text-left font-normal text-sm",
                        !filters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {filters.dateTo ? (
                        format(filters.dateTo, "dd/MM/yy", { locale: es })
                      ) : (
                        <span className="text-xs">Hasta</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={handleDateToChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

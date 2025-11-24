"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectStatus, ProjectType } from "@prisma/client";
import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { formatUSDCompact } from "@/lib/carbon/market-prices";

interface Project {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  department: string;
  municipality: string | null;
  areaHectares: number;
  estimatedCo2TonsYear: number | null;
  forestCoveragePercent: number | null;
  geeVerified: boolean;
  organization: {
    id: string;
    name: string;
  };
  createdAt: string;
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

const TYPE_LABELS: Record<ProjectType, string> = {
  REDD_PLUS: "REDD+",
  REFORESTATION: "Reforestación",
  RENEWABLE_ENERGY: "Energía Renovable",
  REGENERATIVE_AGRICULTURE: "Agricultura Regenerativa",
  COMMUNITY_CONSERVATION: "Conservación Comunitaria",
};

export function ProjectTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, [pagination.pageIndex, columnFilters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
      });

      // Add filters
      columnFilters.forEach((filter) => {
        if (filter.value) {
          params.append(filter.id, String(filter.value));
        }
      });

      const response = await fetch(`/api/projects?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => {
        const verified = row.original.geeVerified;
        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/proyectos/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {row.getValue("name")}
            </Link>
            {verified && (
              <CheckCircle2 className="h-4 w-4 text-green-600" title="Verificado con GEE" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline">
          {TYPE_LABELS[row.getValue("type") as ProjectType]}
        </Badge>
      ),
    },
    {
      accessorKey: "department",
      header: "Departamento",
    },
    {
      accessorKey: "areaHectares",
      header: "Área (ha)",
      cell: ({ row }) => {
        const area = row.getValue("areaHectares") as number;
        return area.toLocaleString("es-BO", { maximumFractionDigits: 2 });
      },
    },
    {
      accessorKey: "estimatedCo2TonsYear",
      header: "CO₂/año",
      cell: ({ row }) => {
        const co2 = row.getValue("estimatedCo2TonsYear") as number | null;
        if (!co2) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="font-medium">
            {co2.toLocaleString("es-BO", { maximumFractionDigits: 0 })} tCO₂
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as ProjectStatus;
        return (
          <Badge className={STATUS_COLORS[status]}>
            {STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString("es-BO");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const project = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/proyectos/${project.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalles
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/proyectos/${project.id}/editar`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(project.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este proyecto?")) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por nombre..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={
            (table.getColumn("department")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table.getColumn("department")?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="La Paz">La Paz</SelectItem>
            <SelectItem value="Santa Cruz">Santa Cruz</SelectItem>
            <SelectItem value="Cochabamba">Cochabamba</SelectItem>
            <SelectItem value="Beni">Beni</SelectItem>
            <SelectItem value="Pando">Pando</SelectItem>
            <SelectItem value="Potosí">Potosí</SelectItem>
            <SelectItem value="Oruro">Oruro</SelectItem>
            <SelectItem value="Chuquisaca">Chuquisaca</SelectItem>
            <SelectItem value="Tarija">Tarija</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Cargando proyectos...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron proyectos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {projects.length} proyecto(s) en esta página
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}

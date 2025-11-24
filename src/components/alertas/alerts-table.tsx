"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
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
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "./severity-badge";
import { AlertStatusSelect } from "./alert-status-select";
import { AlertListItem } from "@/types/alert";
import { MapPin, ArrowUpDown, Eye } from "lucide-react";
import Link from "next/link";

interface AlertsTableProps {
  alerts: AlertListItem[];
  onAlertClick?: (alert: AlertListItem) => void;
  onStatusChanged?: () => void;
}

export function AlertsTable({ alerts, onAlertClick, onStatusChanged }: AlertsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "detectedAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<AlertListItem>[] = [
    {
      accessorKey: "location",
      header: "Ubicación",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {row.original.latitude.toFixed(4)}, {row.original.longitude.toFixed(4)}
          </div>
          <div className="text-sm font-medium">{row.original.department}</div>
          {row.original.municipality && (
            <div className="text-xs text-muted-foreground">
              {row.original.municipality}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "detectedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Fecha
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.original.detectedAt);
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {date.toLocaleDateString("es-BO")}
            </div>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleTimeString("es-BO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "severity",
      header: "Severidad",
      cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <AlertStatusSelect
          alertId={row.original.id}
          currentStatus={row.original.status}
          currentNotes={row.original.notes}
          onStatusChanged={onStatusChanged}
        />
      ),
    },
    {
      accessorKey: "confidence",
      header: "Confianza",
      cell: ({ row }) =>
        row.original.confidence ? (
          <div className="text-sm font-medium">{row.original.confidence}%</div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: "nearProject",
      header: "Proyecto Cercano",
      cell: ({ row }) =>
        row.original.nearProject ? (
          <div className="space-y-1">
            <Link
              href={`/proyectos/${row.original.nearProject.id}`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {row.original.nearProject.name}
            </Link>
            {row.original.nearProjectDistance && (
              <div className="text-xs text-red-600 font-medium">
                {row.original.nearProjectDistance.toFixed(2)} km
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAlertClick && onAlertClick(row.original)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: alerts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por departamento..."
          value={(table.getColumn("location")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("location")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron alertas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {table.getState().pagination.pageIndex * 20 + 1} a{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * 20,
            alerts.length
          )}{" "}
          de {alerts.length} alertas
        </div>
        <div className="flex items-center gap-2">
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

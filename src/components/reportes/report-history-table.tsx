"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Download, Trash2, FileText, Table2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GeneratedReport {
  id: string;
  reportType: string;
  format: "PDF" | "EXCEL";
  title: string;
  fileName: string;
  fileUrl: string;
  fileSizeKb: number | null;
  generatedBy: string | null;
  generatedAt: Date;
  parameters: Record<string, unknown>;
  status: string;
}

const reportTypeLabels: Record<string, string> = {
  NATIONAL: "Nacional",
  DEPARTMENT: "Departamental",
  PROJECT: "Proyecto",
  MONTHLY: "Mensual",
  ANNUAL: "Anual",
};

function formatFileSize(kb: number | null): string {
  if (!kb) return "N/A";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function ReportHistoryTable({
  reports,
  onDelete,
}: {
  reports: GeneratedReport[];
  onDelete?: (id: string) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  async function handleDownload(report: GeneratedReport) {
    try {
      const response = await fetch(report.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = report.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Reporte descargado");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Error al descargar reporte");
    }
  }

  function confirmDelete(reportId: string) {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!reportToDelete) return;

    try {
      const response = await fetch(`/api/reports?id=${reportToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar reporte");
      }

      toast.success("Reporte eliminado");
      setDeleteDialogOpen(false);
      setReportToDelete(null);

      if (onDelete) {
        onDelete(reportToDelete);
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Error al eliminar reporte");
    }
  }

  const columns: ColumnDef<GeneratedReport>[] = [
    {
      accessorKey: "reportType",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("reportType") as string;
        return (
          <Badge variant="outline">
            {reportTypeLabels[type] || type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Título",
    },
    {
      accessorKey: "format",
      header: "Formato",
      cell: ({ row }) => {
        const format = row.getValue("format") as string;
        const Icon = format === "PDF" ? FileText : Table2;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span>{format}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "fileSizeKb",
      header: "Tamaño",
      cell: ({ row }) => formatFileSize(row.getValue("fileSizeKb")),
    },
    {
      accessorKey: "generatedAt",
      header: "Fecha",
      cell: ({ row }) => {
        const date = new Date(row.getValue("generatedAt"));
        return date.toLocaleDateString("es-BO", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      accessorKey: "generatedBy",
      header: "Usuario",
      cell: ({ row }) => {
        const user = row.getValue("generatedBy") as string | null;
        return user || "Sistema";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const report = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDownload(report)}>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => confirmDelete(report.id)}
                className="text-destructive"
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

  const table = useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <>
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
                <TableRow key={row.id}>
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
                  No hay reportes generados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <div className="text-sm text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reporte?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El reporte será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

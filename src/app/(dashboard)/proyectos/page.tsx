import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ProjectTable } from "@/components/proyectos/project-table";

export default async function ProyectosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Proyectos de Carbono
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los proyectos de conservación y captura de carbono
          </p>
        </div>
        <Link href="/proyectos/nuevo">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </Link>
      </div>

      <ProjectTable />
    </div>
  );
}

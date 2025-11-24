"use client";

import { useEffect, useState } from "react";
import { ProjectForm } from "@/components/proyectos/project-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  type: string;
}

export default function NuevoProyectoPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/organizations");
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/proyectos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Nuevo Proyecto de Carbono
          </h1>
          <p className="text-muted-foreground mt-2">
            Registra un nuevo proyecto de conservación o captura de carbono
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Cargando formulario...
        </div>
      ) : (
        <ProjectForm organizations={organizations} />
      )}
    </div>
  );
}

import { ProjectForm } from "@/components/proyectos/project-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getOrganizations() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/organizations`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return [];
  }
}

export default async function NuevoProyectoPage() {
  const organizations = await getOrganizations();

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

      <ProjectForm organizations={organizations} />
    </div>
  );
}

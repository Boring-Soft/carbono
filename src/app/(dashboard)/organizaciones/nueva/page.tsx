import { OrganizationForm } from "@/components/organizaciones/organization-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function NuevaOrganizacionPage() {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/organizaciones">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a Organizaciones
          </Link>
        </Button>
      </div>

      {/* Form */}
      <OrganizationForm />
    </div>
  );
}

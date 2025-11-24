"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteOrganizationButtonProps {
  organizationId: string;
  organizationName: string;
  hasActiveProjects: boolean;
}

export function DeleteOrganizationButton({
  organizationId,
  organizationName,
  hasActiveProjects,
}: DeleteOrganizationButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/organizations/${organizationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar organizacion");
      }

      toast.success("Organizacion eliminada exitosamente");
      router.push("/organizaciones");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setShowConfirm(true)}
        disabled={hasActiveProjects || isDeleting}
      >
        {isDeleting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Eliminando...
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Organizacion
          </>
        )}
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleDelete}
        title="Eliminar Organizacion"
        description={`¿Estas seguro que deseas eliminar la organizacion "${organizationName}"? Esta accion no se puede deshacer.`}
        confirmText="Si, eliminar"
        cancelText="No, cancelar"
        variant="destructive"
      />
    </>
  );
}

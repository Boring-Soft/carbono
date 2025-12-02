"use client";

import { Trees } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ForestBoundariesControlProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  loading?: boolean;
}

/**
 * Control to toggle forest boundaries layer on/off
 *
 * Shows thick black borders around major forest regions in Bolivia:
 * - Amazonía Norte (Pando, Beni)
 * - Chiquitanía (Santa Cruz)
 * - Yungas (La Paz, Cochabamba)
 * - Chaco (Sur de Bolivia)
 *
 * Usage:
 * ```tsx
 * <ForestBoundariesControl
 *   enabled={showBoundaries}
 *   onToggle={setShowBoundaries}
 * />
 * ```
 */
export function ForestBoundariesControl({
  enabled,
  onToggle,
  loading = false,
}: ForestBoundariesControlProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-2">
      <div className="flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-2">
          <Trees className="h-4 w-4 text-green-700" />
          <Label
            htmlFor="forest-boundaries-toggle"
            className="text-sm font-medium cursor-pointer"
          >
            Límites Forestales
          </Label>
        </div>
        <Switch
          id="forest-boundaries-toggle"
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={loading}
        />
      </div>
      {enabled && (
        <p className="text-xs text-muted-foreground">
          Muestra los límites de los principales sectores forestales de Bolivia
        </p>
      )}
      {loading && (
        <p className="text-xs text-blue-600">Cargando límites forestales...</p>
      )}
    </div>
  );
}

"use client";

import { Satellite, Map } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card } from "@/components/ui/card";

export type MapViewMode = "street" | "satellite";

interface SatelliteLayerControlProps {
  viewMode: MapViewMode;
  onViewModeChange: (mode: MapViewMode) => void;
  className?: string;
}

export function SatelliteLayerControl({
  viewMode,
  onViewModeChange,
  className = "",
}: SatelliteLayerControlProps) {
  return (
    <Card className={`p-2 ${className}`}>
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => {
          if (value) onViewModeChange(value as MapViewMode);
        }}
        className="gap-1"
      >
        <ToggleGroupItem
          value="street"
          aria-label="Vista de calles"
          className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <Map className="h-4 w-4" />
          <span className="hidden sm:inline">Calles</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="satellite"
          aria-label="Vista satélite"
          className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <Satellite className="h-4 w-4" />
          <span className="hidden sm:inline">Satélite</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </Card>
  );
}

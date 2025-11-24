"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle, Satellite, Map } from "lucide-react";

interface MapControlsProps {
  showProjects: boolean;
  showAlerts: boolean;
  satelliteView: boolean;
  onToggleProjects: (show: boolean) => void;
  onToggleAlerts: (show: boolean) => void;
  onToggleSatelliteView: (satellite: boolean) => void;
}

export function MapControls({
  showProjects,
  showAlerts,
  satelliteView,
  onToggleProjects,
  onToggleAlerts,
  onToggleSatelliteView,
}: MapControlsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="show-projects"
              className="flex items-center gap-2 cursor-pointer"
            >
              <MapPin className="h-4 w-4 text-green-600" />
              <span>Proyectos</span>
            </Label>
            <Switch
              id="show-projects"
              checked={showProjects}
              onCheckedChange={onToggleProjects}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label
              htmlFor="show-alerts"
              className="flex items-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span>Alertas</span>
            </Label>
            <Switch
              id="show-alerts"
              checked={showAlerts}
              onCheckedChange={onToggleAlerts}
            />
          </div>

          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-3 block">Vista del Mapa</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={!satelliteView ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleSatelliteView(false)}
                className="w-full"
              >
                <Map className="h-4 w-4 mr-2" />
                Estándar
              </Button>
              <Button
                variant={satelliteView ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleSatelliteView(true)}
                className="w-full"
              >
                <Satellite className="h-4 w-4 mr-2" />
                Satélite
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

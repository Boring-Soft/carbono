"use client";

import { useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trees } from "lucide-react";

interface DensityThresholdSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

// Predefined threshold presets
const PRESETS = [
  { value: 10, label: "Permisivo", description: "Incluye áreas con poca vegetación", color: "bg-yellow-500" },
  { value: 30, label: "Estándar", description: "Balance entre precisión y cobertura", color: "bg-blue-500" },
  { value: 50, label: "Estricto", description: "Solo áreas con vegetación densa", color: "bg-green-500" },
  { value: 70, label: "Muy Estricto", description: "Solo bosques densos", color: "bg-emerald-700" },
];

export function DensityThresholdSlider({
  value,
  onChange,
  className = "",
}: DensityThresholdSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  // Get current preset info
  const getCurrentPreset = useCallback((val: number) => {
    if (val <= 10) return PRESETS[0];
    if (val <= 30) return PRESETS[1];
    if (val <= 50) return PRESETS[2];
    return PRESETS[3];
  }, []);

  const currentPreset = getCurrentPreset(localValue);

  const handleValueChange = (newValue: number[]) => {
    const val = newValue[0];
    setLocalValue(val);
    onChange(val);
  };

  const handlePresetClick = (presetValue: number) => {
    setLocalValue(presetValue);
    onChange(presetValue);
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trees className="h-5 w-5 text-green-600" />
            <Label className="text-base font-semibold">
              Umbral de Densidad Forestal
            </Label>
          </div>
          <Badge variant="outline" className={`${currentPreset.color} text-white`}>
            {currentPreset.label}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">
          {currentPreset.description}
        </p>

        {/* Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">10%</span>
            <span className="font-medium">{localValue}%</span>
            <span className="text-muted-foreground">100%</span>
          </div>
          <Slider
            value={[localValue]}
            onValueChange={handleValueChange}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              className={`p-2 text-sm rounded-md border transition-all ${
                localValue === preset.value
                  ? "border-primary bg-primary/10 font-medium"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${preset.color}`} />
                <span>{preset.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {preset.value}%
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
          <strong>Nota:</strong> Un umbral más alto excluirá más áreas, resultando en
          polígonos más pequeños pero con mayor certeza de cobertura forestal.
        </div>
      </CardContent>
    </Card>
  );
}

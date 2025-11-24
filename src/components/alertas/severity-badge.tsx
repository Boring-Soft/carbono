import { Badge } from "@/components/ui/badge";
import { AlertSeverity } from "@/types/alert";
import { cn } from "@/lib/utils";

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  {
    label: string;
    className: string;
  }
> = {
  LOW: {
    label: "Baja",
    className: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  MEDIUM: {
    label: "Media",
    className: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  HIGH: {
    label: "Alta",
    className: "bg-red-500 hover:bg-red-600 text-white",
  },
};

interface SeverityBadgeProps {
  severity: AlertSeverity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

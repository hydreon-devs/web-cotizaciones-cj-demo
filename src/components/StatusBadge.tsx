import { cn } from "@/lib/utils";

type Status = "aprobada" | "pendiente" | "rechazada" | "expirada";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  aprobada: {
    label: "Aprobada",
    className: "bg-success/10 text-success border-success/20",
  },
  pendiente: {
    label: "Pendiente",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  rechazada: {
    label: "Rechazada",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  expirada: {
    label: "Expirada",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;

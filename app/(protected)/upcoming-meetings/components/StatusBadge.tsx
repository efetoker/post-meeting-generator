// app/(protected)/upcoming-meetings/components/StatusBadge.tsx

import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

const statusMap = {
  SCHEDULED: {
    text: "Scheduled",
    icon: "lucide:clock",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  },
  PROCESSING: {
    text: "Processing",
    icon: "lucide:loader-circle",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
  },
  TRANSCRIBING: {
    text: "Processing",
    icon: "lucide:loader-circle",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  },
  COMPLETED: {
    text: "Completed",
    icon: "lucide:check-circle",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  },
  FAILED: {
    text: "Failed",
    icon: "lucide:x-circle",
    color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  },
};

export type Status = keyof typeof statusMap;

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const currentStatus = statusMap[status] || statusMap.SCHEDULED;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        currentStatus.color
      )}
    >
      <Icon
        icon={currentStatus.icon}
        className={cn("h-3 w-3", status === "TRANSCRIBING" && "animate-spin")}
      />
      {currentStatus.text}
    </div>
  );
}

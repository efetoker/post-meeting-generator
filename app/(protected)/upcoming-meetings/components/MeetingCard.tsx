// app/(protected)/upcoming-meetings/components/MeetingCard.tsx

import { Label } from "@/components/ui/label";
import { PlatformIcon } from "./PlatformIcon";
import { Switch } from "@/components/ui/switch";
import { EnrichedCalendarEvent } from "../page";
import { cn, getMeetingInfo } from "@/lib/utils";
import { AttendeeAvatars } from "./AttendeeAvatars";
import { Status, StatusBadge } from "./StatusBadge";

export function MeetingCard({
  event,
  onToggleChange,
  isOperating,
  showAccountEmail,
}: {
  event: EnrichedCalendarEvent;
  onToggleChange: (event: EnrichedCalendarEvent, isChecked: boolean) => void;
  isOperating: boolean;
  showAccountEmail: boolean;
}) {
  const meetingInfo = getMeetingInfo(event);
  const isRecordable = !!meetingInfo;

  let startTime = new Date(event.start.dateTime!).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (!startTime || startTime === "Invalid Date") {
    startTime = new Date(event.start.date! + "T00:00").toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return (
    <div
      className={cn(
        "p-4 border rounded-lg flex flex-col items-start gap-4 transition-colors sm:flex-row sm:items-center",
        !isRecordable && "bg-muted/50 opacity-70"
      )}
    >
      <div className="flex flex-col sm:items-center justify-center w-full sm:w-24">
        <div className="font-semibold text-lg">{startTime.split(" ")[0]}</div>
        <div className="text-xs text-muted-foreground">
          {startTime.split(" ")[1]}
        </div>
        <div className="mt-2">
          <PlatformIcon platform={meetingInfo?.platform ?? null} />
        </div>
      </div>
      <div className="flex-1 sm:border-l w-full sm:w-auto sm:pl-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold">{event.summary || "No Title"}</h3>
          {isRecordable && <StatusBadge status={event.status as Status} />}
        </div>
        {showAccountEmail && (
          <p className="text-sm text-muted-foreground">
            From: {event.sourceAccountEmail}
          </p>
        )}
        {isRecordable && <AttendeeAvatars attendees={event.attendees} />}
      </div>
      {isRecordable ? (
        <div className="flex items-center space-x-3 sm:w-40 justify-end">
          <Label
            htmlFor={`record-${event.id}`}
            className="text-sm cursor-pointer"
          >
            Record
          </Label>
          <Switch
            id={`record-${event.id}`}
            disabled={isOperating || event.status !== "SCHEDULED"}
            defaultChecked={event.isRecordingEnabled}
            onCheckedChange={(isChecked) => onToggleChange(event, isChecked)}
          />
        </div>
      ) : (
        <div className="w-40 text-right text-sm text-muted-foreground pr-2">
          No meeting link found
        </div>
      )}
    </div>
  );
}

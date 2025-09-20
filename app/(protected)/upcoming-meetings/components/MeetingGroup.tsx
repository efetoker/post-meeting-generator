// app/(protected)/upcoming-meetings/components/MeetingGroup.tsx

import { EnrichedCalendarEvent } from "../page";
import { MeetingCard } from "./MeetingCard";

export function MeetingGroup({
  date,
  events,
  onToggleChange,
}: {
  date: string;
  events: EnrichedCalendarEvent[];
  onToggleChange: Function;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-muted-foreground mb-3">
        {date}
      </h2>
      <div className="space-y-3">
        {events.map((event) => (
          <MeetingCard
            key={event.id}
            event={event}
            onToggleChange={onToggleChange}
          />
        ))}
      </div>
    </div>
  );
}

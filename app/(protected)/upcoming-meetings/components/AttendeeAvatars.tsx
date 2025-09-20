// app/(protected)/upcoming-meetings/components/AttendeeAvatars.tsx

"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Attendee {
  email: string;
}

const getInitials = (email: string) => {
  const name = email.split("@")[0];
  const parts = name.split(/[.-]/);
  if (parts.length > 1) {
    return (parts[0][0] + (parts[1][0] || "")).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export function AttendeeAvatars({ attendees }: { attendees?: Attendee[] }) {
  if (!attendees || attendees.length === 0) {
    return (
      <p className="text-xs text-muted-foreground mt-2">
        Just you in this meeting.
      </p>
    );
  }

  const visibleAttendees = attendees.slice(0, 4);
  const remainingAttendees = attendees.slice(4);
  const remainingCount = remainingAttendees.length;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center space-x-[-8px] mt-2">
        {visibleAttendees.map((attendee) => (
          <Tooltip key={attendee.email}>
            <TooltipTrigger asChild>
              <div className="h-7 w-7 flex items-center justify-center rounded-full bg-muted border-2 border-background text-xs font-semibold text-muted-foreground cursor-default">
                {getInitials(attendee.email)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{attendee.email}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="h-7 w-7 flex items-center justify-center rounded-full bg-muted border-2 border-background text-xs font-semibold text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                +{remainingCount}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="space-y-2">
                <p className="font-semibold text-sm px-2">More attendees:</p>
                <div className="max-h-48 overflow-y-auto">
                  {remainingAttendees.map((attendee) => (
                    <div
                      key={attendee.email}
                      className="text-sm p-2 rounded-md hover:bg-muted"
                    >
                      {attendee.email}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </TooltipProvider>
  );
}

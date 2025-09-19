// lib/utils.ts

import { CalendarEvent } from "@/types/calendar";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const meetingUrlRegex =
  /https:\/\/(?:[a-zA-Z0-9-]+\.)?(?:zoom\.us|meet\.google\.com|teams\.microsoft\.com)\/[^\s,"]+/;

export function getMeetingInfo(
  event: CalendarEvent
): { link: string; platform: string } | null {
  let link: string | null = null;

  if (event.hangoutLink) {
    link = event.hangoutLink;
  } else {
    const textToSearch = `${event.location || ""} ${event.description || ""}`;
    const match = textToSearch.match(meetingUrlRegex);
    link = match ? match[0] : null;
  }

  if (!link) {
    return null;
  }

  let platform = "Unknown";
  if (link.includes("zoom.us")) platform = "Zoom";
  else if (link.includes("meet.google.com")) platform = "Google Meet";
  else if (link.includes("teams.microsoft.com")) platform = "Microsoft Teams";

  return { link, platform };
}

// app/(protected)/upcoming-meetings/components/EmptyState.tsx

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function EmptyState() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Upcoming Meetings</h1>
        <p className="text-muted-foreground">
          View your upcoming calendar events and manage recording settings.
        </p>
      </div>
      <Card className="text-center py-10">
        <CardHeader>
          <CardTitle>🗓️ All Clear!</CardTitle>
          <CardDescription>
            You have no upcoming meetings on your calendar.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

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
      <h1 className="text-3xl font-bold mb-6">Upcoming Meetings</h1>
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

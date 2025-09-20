// app/(protected)/upcoming-meetings/components/ErrorState.tsx

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Meetings</h1>
      <Card className="text-center py-10 border-destructive">
        <CardHeader>
          <CardTitle>😕 Something Went Wrong</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

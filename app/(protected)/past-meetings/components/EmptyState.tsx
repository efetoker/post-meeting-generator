// app/(protected)/past-meetings/components/EmptyState.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Icon } from "@iconify/react";

export function EmptyState() {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto bg-muted rounded-full p-3 w-fit">
          <Icon
            icon="lucide:archive"
            className="h-8 w-8 text-muted-foreground"
          />
        </div>
      </CardHeader>
      <CardContent className="pb-8">
        <CardTitle className="mb-2">No Past Meetings Found</CardTitle>
        <CardDescription>
          Completed meetings with transcripts will appear here once they are
          processed.
        </CardDescription>
      </CardContent>
    </Card>
  );
}

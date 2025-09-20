// app/(protected)/upcoming-meetings/components/LoadingSkeleton.tsx

export function LoadingSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Meetings</h1>
      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i}>
            <div className="h-7 w-48 bg-muted rounded-md mb-3 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div
                  key={j}
                  className="h-24 bg-muted/50 border rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

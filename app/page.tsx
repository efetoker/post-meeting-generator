// app/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">
          Post-Meeting Content Generator
        </h1>
        {session ? (
          <div>
            <p className="mb-4">
              Welcome, <strong>{session.user?.name}</strong>!
            </p>
            <Button onClick={() => signOut()} variant="destructive">
              Sign Out
            </Button>
          </div>
        ) : (
          <div>
            <p className="mb-4">Please sign in to continue.</p>
            <Button onClick={() => signIn("google")}>
              Sign in with Google
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

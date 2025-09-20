// app/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, SignOutButton } from "@/app/components/AuthButtons";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Post-Meeting Content Generator
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Turn your meeting transcripts into engaging social media posts and
          follow-up emails instantly.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          {session ? (
            <>
              <p>
                Welcome back, <strong>{session.user?.name}</strong>!
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">Get started in seconds.</p>
              <SignInButton />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

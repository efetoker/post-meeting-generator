// app/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SignInButton } from "@/app/components/AuthButtons";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/upcoming-meetings");
  }

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
          <p className="text-muted-foreground">Get started in seconds.</p>
          <SignInButton />
        </div>
      </div>
    </main>
  );
}

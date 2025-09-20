// app/components/Navbar.tsx

import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SignOutButton } from "@/app/components/AuthButtons";
import { Logo } from "@/app/components/Logo";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
            <span className="hidden font-bold sm:inline-block">
              Post-Meeting Generator
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center space-x-6 text-sm font-medium">
          {session && (
            <>
              <Link href="/upcoming-meetings">Upcoming Meetings</Link>
              <Link href="/meetings">Past Meetings</Link>
              <Link href="/settings">Settings</Link>
            </>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {session && (
            <>
              <span className="hidden text-sm sm:inline-block">
                {session.user?.name}
              </span>
              <SignOutButton />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

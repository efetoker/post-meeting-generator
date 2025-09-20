// app/components/Navbar.tsx

import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="font-bold text-lg">
          Post-Meeting Generator
        </Link>
        <div className="space-x-4">
          {session && (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/meetings">Past Meetings</Link>
              <Link href="/settings">Settings</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

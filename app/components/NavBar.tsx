// app/components/Navbar.tsx

import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SignOutButton } from "@/app/components/AuthButtons";
import { Logo } from "@/app/components/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Icon } from "@iconify/react";

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="text-muted-foreground transition-colors hover:text-foreground"
  >
    {children}
  </Link>
);

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
            <span className="hidden font-bold sm:inline-block">
              Post-Meeting Generator
            </span>
          </Link>
          {session && (
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <NavLink href="/upcoming-meetings">Upcoming Meetings</NavLink>
              <NavLink href="/past-meetings">Past Meetings</NavLink>
              <NavLink href="/settings">Settings</NavLink>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session && (
            <>
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm font-semibold text-foreground/80">
                  {session.user?.name}
                </span>
                <SignOutButton />
              </div>

              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Icon icon="lucide:menu" className="h-5 w-5" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <div className="flex flex-col gap-4 text-lg mt-8">
                      <NavLink href="/upcoming-meetings">
                        Upcoming Meetings
                      </NavLink>
                      <NavLink href="/past-meetings">Past Meetings</NavLink>
                      <NavLink href="/settings">Settings</NavLink>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

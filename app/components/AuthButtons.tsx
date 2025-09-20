// app/components/AuthButtons.tsx

"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <Button onClick={() => signIn("google")} size="lg">
      Sign in with Google
    </Button>
  );
}

export function SignOutButton() {
  return (
    <Button onClick={() => signOut()} variant="destructive">
      Sign Out
    </Button>
  );
}

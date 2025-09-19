// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/app/components/AuthProvider";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Post-Meeting Generator",
  description: "AI-powered social media content from your meetings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b">
          <nav className="container mx-auto flex items-center justify-between p-4">
            <Link href="/" className="font-bold text-lg">
              Post-Meeting Generator
            </Link>
            <div className="space-x-4">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/settings">Settings</Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

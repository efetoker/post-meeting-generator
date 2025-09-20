// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/app/components/AuthProvider";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/NavBar";

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
        <Toaster position="top-center" />
        <Navbar />
        <main>
          <AuthProvider>{children}</AuthProvider>
        </main>
      </body>
    </html>
  );
}

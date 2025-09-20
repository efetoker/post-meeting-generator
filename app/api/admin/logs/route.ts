// app/api/admin/logs/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.cronLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch cron logs:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

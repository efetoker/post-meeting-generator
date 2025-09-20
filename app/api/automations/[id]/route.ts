// app/api/automations/[id]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, platform, prompt, example } = await request.json();
    const automation = await prisma.automation.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        name,
        platform,
        prompt,
        example,
      },
    });

    if (automation.count === 0) {
      return NextResponse.json(
        { error: "Automation not found or access denied" },
        { status: 404 }
      );
    }

    const updatedAutomation = await prisma.automation.findUnique({
      where: { id },
    });

    return NextResponse.json(updatedAutomation);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update automation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const automation = await prisma.automation.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (automation.count === 0) {
      return NextResponse.json(
        { error: "Automation not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete automation" },
      { status: 500 }
    );
  }
}

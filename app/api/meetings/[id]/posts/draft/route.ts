// app/api/meetings/[id]/posts/draft/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found or access denied." },
        { status: 404 }
      );
    }

    const deleteResult = await prisma.socialPost.deleteMany({
      where: {
        meetingId: id,
        status: "DRAFT",
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error("Failed to delete draft posts:", error);
    return NextResponse.json(
      { error: "Failed to delete draft posts." },
      { status: 500 }
    );
  }
}

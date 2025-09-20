// app/api/post/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content } = await request.json();
    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required and must be a string." },
        { status: 400 }
      );
    }

    const updatedPost = await prisma.socialPost.update({
      where: {
        id: id,
        meeting: {
          userId: session.user.id,
        },
      },
      data: {
        content: content,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Failed to update post content:", error);
    return NextResponse.json(
      { error: "Failed to update post content." },
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
    const post = await prisma.socialPost.findFirst({
      where: {
        id: id,
        meeting: {
          userId: session.user.id,
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found or access denied." },
        { status: 404 }
      );
    }

    await prisma.socialPost.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, message: "Post deleted." });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json(
      { error: "Failed to delete post." },
      { status: 500 }
    );
  }
}

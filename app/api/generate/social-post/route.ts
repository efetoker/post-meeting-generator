// app/api/generate/social-post/route.ts

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { transcript, automationId, meetingId } = await request.json();

    const automation = await prisma.automation.findUnique({
      where: { id: automationId },
    });

    if (!automation || automation.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Automation not found." },
        { status: 404 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `${automation.prompt}\n\nHere is the meeting transcript:\n---\n${transcript}`;

    const result = await model.generateContent(prompt);
    const postContent = result.response.text();

    const newPost = await prisma.socialPost.create({
      data: {
        platform: automation.platform,
        content: postContent,
        meetingId: meetingId,
      },
    });

    return NextResponse.json(newPost);
  } catch (error) {
    console.error("Error generating social post:", error);
    return NextResponse.json(
      { error: "Failed to generate post." },
      { status: 500 }
    );
  }
}

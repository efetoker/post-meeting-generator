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

    const finalPrompt = `
      You are an AI assistant creating a social media post for a professional (e.g., a financial advisor).
      Your task is to follow the user's instructions to generate a post based on a meeting transcript.

      **User's Instructions:**
      ---
      ${automation.prompt}
      ---
      
      **Meeting Transcript:**
      ---
      ${transcript}
      ---

      **Your Final Output MUST be ONLY the text of the social media post and nothing else.**
      Do not include titles, options, explanations, or any text other than the post itself.
    `;

    const result = await model.generateContent(finalPrompt);
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

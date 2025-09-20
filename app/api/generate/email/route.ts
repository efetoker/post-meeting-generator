// app/api/generate/email/route.ts

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  console.log("GEMINI_API_KEY on Vercel:", process.env.GEMINI_API_KEY);

  try {
    const { transcript } = await request.json();
    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert assistant for a professional who just finished a meeting. Your task is to draft a follow-up email from the perspective of one of the participants to a client or colleague who was also in the meeting.

      Follow these instructions precisely:
      1.  **Adopt the Persona of a Participant**: Write as "I" or "we," not as an outside observer.
      2.  **Focus on Client-Relevant Outcomes**: Do NOT summarize procedural language like "a motion was made," "the vote was 17-2," or "the agenda is approved." Instead, focus only on the key decisions, action items, and next steps that would be relevant to a client or stakeholder.
      3.  **Structure**:
          * **Greeting**: Use a generic placeholder like "Hi [Recipient Name]," for the greeting.
          * **Summary**: Briefly summarize the 1-3 most important business decisions or topics discussed.
          * **Action Items**: List any tasks assigned to specific people or clear next steps.
          * **Closing**: Use a professional closing like "Best regards,".
          * **Signature**: Use a generic placeholder like "[Your Name]". Do not infer any names from the transcript.
      4.  **Tone**: Keep the tone friendly, professional, and forward-looking.

      Based on this, draft a follow-up email for the following transcript:
      ---
      ${transcript}
      ---
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const emailContent = response.text();

    return NextResponse.json({ email: emailContent });
  } catch (error) {
    console.error("Error generating email with Gemini:", error);
    return NextResponse.json(
      { error: "Failed to generate email." },
      { status: 500 }
    );
  }
}

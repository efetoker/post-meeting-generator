# Post-Meeting Social Media Content Generator

It's a web application designed to help financial advisors and other professionals generate social media content automatically from their client meetings.

The application connects to a user's Google Calendar, uses **Recall.ai** to send a notetaker bot to record and transcribe virtual meetings, and then leverages an AI model to generate draft follow-up emails and social media posts based on the meeting's content.

## ✨ Core Features

* **Google Integration**: Securely log in with Google. The app automatically pulls in all upcoming events from the user's connected Google Calendars.
* **Automated Meeting Recording**: Users can toggle a switch for any upcoming meeting to have an AI notetaker (from Recall.ai) automatically join and transcribe the call.
* **AI Content Generation**: After a meeting, the full transcript is used to generate:
    * A draft follow-up email summarizing the discussion.
    * Draft social media posts (LinkedIn, Facebook) based on configurable "Automations".
* **Social Media Posting**: Connect LinkedIn and Facebook accounts via OAuth to post the generated content directly from the app with a single click.
* **Customizable Automations**: Users can configure custom prompts and settings to tailor the tone and style of the generated content for different social media platforms.
* **Meeting History**: A dashboard displays a history of past meetings, giving access to transcripts and all generated content.

## 🚀 Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Authentication**: [NextAuth.js](https://next-auth.js.org/)
* **Database/ORM**: [Prisma](https://www.prisma.io/) with a [Supabase](https://supabase.com/) PostgreSQL database
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
* **AI**: [OpenAI API](https://openai.com/blog/openai-api)
* **Meeting Transcription**: [Recall.ai API](https://recall.ai/)
* **Deployment**: [Vercel](https://vercel.com/)

## 🛠️ Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd post-meeting-generator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file at the root of the project and populate it with the necessary API keys and credentials (Supabase DB URL, Google OAuth, NextAuth Secret, Recall.ai, OpenAI).

4.  **Push the database schema:**
    ```bash
    npx prisma db push
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔗 Live Demo

(Link to the fully deployed Vercel app will be here upon completion.)
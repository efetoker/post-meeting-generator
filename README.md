# Post-Meeting Content Generator

A full-stack web application that transforms meeting transcripts into ready-to-publish social media content and follow-up emails. Designed for professionals, this tool automates the content creation workflow, saving time and ensuring consistent communication after every meeting.

## ✨ Core Features

- **Multi-Calendar Sync**: Securely log in with a primary Google account and connect additional Google Calendars to aggregate all upcoming events in one place.
- **Automated Meeting Transcription**: Toggle a switch for any upcoming meeting to have an AI notetaker (powered by **Recall.ai**) automatically join, record, and transcribe the call.
- **Dynamic Meeting Status**: The dashboard provides real-time status updates for meetings, transitioning from `Scheduled` ➡️ `Processing` ➡️ `Transcribing` ➡️ `Completed`. A manual refresh button ensures you always have the latest information.
- **Interactive AI Toolkit**:
  - **Auto-Generated Drafts**: Automatically generates a draft follow-up email upon viewing a completed meeting.
  - **Review & Edit**: AI-generated social posts appear in a "Review & Post" dialog, allowing for full text editing before publishing.
  - **Custom Prompts**: Create and manage reusable "Automations" with custom prompts to tailor the AI's tone and style for different platforms (e.g., a professional tone for LinkedIn, a casual one for Facebook).
- **Direct Social Publishing**: Connect LinkedIn and Facebook accounts via OAuth. Publish edited content directly to your chosen platform and automatically retrieve the public URL of the live post.
- **Fully Responsive Design**: A polished and intuitive UI that works seamlessly on both desktop and mobile devices.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Database/ORM**: [Prisma](https://www.prisma.io/) with a [Supabase](https://supabase.com/) PostgreSQL database
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **AI**: **Google Gemini API**
- **Meeting Transcription**: [Recall.ai API](https://recall.ai/)
- **Deployment**: [Vercel](https://vercel.com/)

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
    Create a `.env.local` file by copying `env.example`. Populate it with your credentials for:

    - Supabase (Database URLs)
    - Google (OAuth Client ID & Secret)
    - NextAuth (Secret & URL)
    - Recall.ai (API Key)
    - Google Gemini (API Key)
    - LinkedIn & Facebook (OAuth Credentials)

4.  **Push the database schema:**

    ```bash
    npx prisma db push
    ```

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

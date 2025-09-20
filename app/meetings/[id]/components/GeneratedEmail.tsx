// app/meetings/[id]/components/GeneratedEmail.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GeneratedEmailProps {
  transcript: string;
}

export function GeneratedEmail({ transcript }: GeneratedEmailProps) {
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    setGeneratedEmail("");
    try {
      const response = await fetch("/api/generate/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      if (!response.ok) throw new Error("Failed to generate email.");
      const data = await response.json();
      setGeneratedEmail(data.email);
    } catch (error) {
      console.error("Failed to generate email", error);
      // !TODO: Show an error message in the UI
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <Button onClick={handleGenerateEmail} disabled={isGenerating}>
        {isGenerating ? "Generating..." : "✨ Generate Follow-up Email"}
      </Button>

      {generatedEmail && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold mb-4">Draft Follow-up Email</h2>
          <Card>
            <CardContent className="p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {generatedEmail}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// app/(protected)/settings/components/Automations.tsx

"use client";

import { FormEvent, useState } from "react";
import { Automation } from "@prisma/client";
import { toast } from "react-hot-toast";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AutomationsProps {
  automations: Automation[];
  setAutomations: React.Dispatch<React.SetStateAction<Automation[]>>;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  let iconName = "";
  if (platform === "LinkedIn") iconName = "logos:linkedin-icon";
  if (platform === "Facebook") iconName = "logos:facebook";
  if (!iconName) return null;

  return <Icon icon={iconName} className="h-6 w-6" />;
};

export function Automations({ automations, setAutomations }: AutomationsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAutomation = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const newAutomationData = {
      name: formData.get("name") as string,
      platform: formData.get("platform") as string,
      prompt: formData.get("prompt") as string,
      example: formData.get("example") as string,
    };

    const promise = fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAutomationData),
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error("Failed to create automation.");
      }
      return res.json();
    });

    toast
      .promise(promise, {
        loading: "Saving automation...",
        success: (createdAutomation) => {
          setAutomations((prev) => [...prev, createdAutomation]);
          setIsDialogOpen(false); // Close dialog on success
          return "Automation created successfully!";
        },
        error: (err) => err.toString(),
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>Automations</CardTitle>
          <CardDescription>
            Configure custom prompts to generate social media posts.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
              Add Automation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Automation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAutomation} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Automation Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Weekly Financial Tip for LinkedIn"
                  required
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select name="type" defaultValue="generate_post">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generate_post">Generate post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select name="platform" required defaultValue="LinkedIn">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="prompt">Description (Prompt)</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  required
                  rows={5}
                  placeholder="Draft a LinkedIn post based on the following key points..."
                />
              </div>
              <div>
                <Label htmlFor="example">
                  Example Output (Optional)
                  <p className="text-xs font-normal text-muted-foreground">
                    Provide an example of the tone and format you want.
                  </p>
                </Label>
                <Textarea
                  id="example"
                  name="example"
                  rows={5}
                  placeholder="e.g., '💡 Did you know...? Here's a quick tip...'"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : "Save Automation"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {automations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
            <h3 className="text-lg font-semibold">No Automations Found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Get started by creating your first automation.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              Add Automation
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {automations.map((auto) => (
              <div
                key={auto.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <PlatformIcon platform={auto.platform} />
                  <div>
                    <p className="font-semibold">{auto.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {auto.prompt}
                    </p>
                  </div>
                </div>
                {/* Placeholder for future actions */}
                <Button variant="ghost" size="sm" disabled>
                  Edit
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

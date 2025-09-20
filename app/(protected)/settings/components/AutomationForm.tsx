// app/(protected)/settings/components/AutomationForm.tsx

"use client";

import { FormEvent } from "react";
import { Automation } from "@prisma/client";
import { Button } from "@/components/ui/button";
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

interface AutomationFormProps {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  initialData?: Automation | null;
}

export function AutomationForm({
  handleSubmit,
  isSubmitting,
  initialData,
}: AutomationFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div>
        <Label htmlFor="name" className="mb-2">
          Automation Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g., Weekly Financial Tip for LinkedIn"
          defaultValue={initialData?.name || ""}
          required
        />
      </div>
      <div>
        <Label htmlFor="type" className="mb-2">
          Type
        </Label>
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
        <Label htmlFor="platform" className="mb-2">
          Platform
        </Label>
        <Select
          name="platform"
          required
          defaultValue={initialData?.platform || "LinkedIn"}
        >
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
        <Label htmlFor="prompt" className="mb-2">
          Description (Prompt)
        </Label>
        <Textarea
          id="prompt"
          name="prompt"
          required
          rows={5}
          placeholder="Draft a LinkedIn post based on the following key points..."
          defaultValue={initialData?.prompt || ""}
        />
      </div>
      <div>
        <Label htmlFor="example" className="mb-2">
          Example Output (Optional)
        </Label>
        <Textarea
          id="example"
          name="example"
          rows={5}
          placeholder="e.g., '💡 Did you know...? Here's a quick tip...'"
          defaultValue={initialData?.example || ""}
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? "Saving..."
          : initialData
          ? "Save Changes"
          : "Save Automation"}
      </Button>
    </form>
  );
}

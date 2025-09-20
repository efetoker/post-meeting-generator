// app/past-meetings/[id]/components/PostGeneratorForm.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Automation } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";

interface PostGeneratorFormProps {
  automations: Automation[];
  onGenerate: (automationId: string) => void;
  isGenerating: boolean;
}

export function PostGeneratorForm({
  automations,
  onGenerate,
  isGenerating,
}: PostGeneratorFormProps) {
  const [selectedAutomationId, setSelectedAutomationId] = useState<
    string | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerate = () => {
    if (selectedAutomationId) {
      onGenerate(selectedAutomationId);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild className="mt-4">
        <Card className="cursor-pointer transition-colors hover:bg-muted/30">
          <CardContent className="flex items-center justify-center px-6 gap-2">
            <Icon icon="lucide:plus" className="size-4" />
            <span>Generate Social Media Post</span>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate a post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Label>Select an Automation</Label>
          <Select onValueChange={setSelectedAutomationId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose an automation..." />
            </SelectTrigger>
            <SelectContent>
              {automations.map((auto) => (
                <SelectItem key={auto.id} value={auto.id}>
                  {auto.name} ({auto.platform})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedAutomationId}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

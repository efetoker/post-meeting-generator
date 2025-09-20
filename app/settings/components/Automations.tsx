// app/settings/components/Automations.tsx

"use client";

import { FormEvent } from "react";
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
import { Automation } from "@prisma/client";

interface AutomationsProps {
  automations: Automation[];
  handleAddAutomation: (e: FormEvent<HTMLFormElement>) => void;
}

export function Automations({
  automations,
  handleAddAutomation,
}: AutomationsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Automations</CardTitle>
          <CardDescription>
            Configure how your social media posts are generated.
          </CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Automation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Automation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAutomation} className="space-y-4">
              {/* Form fields for adding an automation */}
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Generate LinkedIn post"
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
                <Select name="platform" required>
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
                  placeholder="1. Draft a post..."
                />
              </div>
              <div>
                <Label htmlFor="example">Example</Label>
                <Textarea
                  id="example"
                  name="example"
                  rows={5}
                  placeholder="An example of the desired output..."
                />
              </div>
              <Button type="submit">Save & Close</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className="flex justify-between items-center p-2 border rounded-md"
            >
              <span>{auto.name}</span>
              <span className="text-sm text-muted-foreground">
                {auto.platform}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// app/(protected)/settings/components/Automations.tsx

"use client";

import { FormEvent, useState } from "react";
import { Automation } from "@prisma/client";
import { toast } from "react-hot-toast";
import { Icon } from "@iconify/react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AutomationForm } from "./AutomationForm";
import { cn } from "@/lib/utils";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(
    null
  );
  const [automationToDelete, setAutomationToDelete] =
    useState<Automation | null>(null);

  const handleOpenDialog = (automation: Automation | null = null) => {
    setEditingAutomation(automation);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingAutomation(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get("id") as string;
    if (id) {
      handleEditAutomation(formData, id);
    } else {
      handleAddAutomation(formData);
    }
  };

  const handleAddAutomation = async (formData: FormData) => {
    setIsSubmitting(true);
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
          setIsDialogOpen(false);
          return "Automation created successfully!";
        },
        error: (err) => err.toString(),
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleEditAutomation = async (formData: FormData, id: string) => {
    setIsSubmitting(true);
    const updatedData = {
      name: formData.get("name") as string,
      platform: formData.get("platform") as string,
      prompt: formData.get("prompt") as string,
      example: formData.get("example") as string,
    };

    const promise = fetch(`/api/automations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed to update automation.");
      return res.json();
    });

    toast
      .promise(promise, {
        loading: "Updating automation...",
        success: (updatedAutomation) => {
          setAutomations((prev) =>
            prev.map((a) => (a.id === id ? updatedAutomation : a))
          );
          handleCloseDialog();
          return "Automation updated successfully!";
        },
        error: (err) => err.toString(),
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDeleteAutomation = async () => {
    if (!automationToDelete) return;

    const promise = fetch(`/api/automations/${automationToDelete.id}`, {
      method: "DELETE",
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to delete automation.");
    });

    toast.promise(promise, {
      loading: "Deleting automation...",
      success: () => {
        setAutomations((prev) =>
          prev.filter((a) => a.id !== automationToDelete.id)
        );
        setAutomationToDelete(null);
        return "Automation deleted.";
      },
      error: (err) => err.toString(),
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Automations</CardTitle>
          <CardDescription>
            Configure custom prompts to generate social media posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {automations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
              <h3 className="text-lg font-semibold">No Automations Found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Get started by creating your first automation.
              </p>
              <Button onClick={() => handleOpenDialog()} variant="outline">
                Add Automation
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex justify-end">
                <Button onClick={() => handleOpenDialog()}>
                  <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
                  Add Automation
                </Button>
              </div>

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
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Icon
                            icon="lucide:more-horizontal"
                            className="h-4 w-4"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleOpenDialog(auto)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setAutomationToDelete(auto)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAutomation ? "Edit Automation" : "Create New Automation"}
            </DialogTitle>
          </DialogHeader>
          <AutomationForm
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            initialData={editingAutomation}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!automationToDelete}
        onOpenChange={() => setAutomationToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              <strong className="mx-1 text-foreground">
                {automationToDelete?.name}
              </strong>
              automation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAutomation}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

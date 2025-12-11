import { useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { KeyRound, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveKey } from "@/services/keystore";
import { toast } from "sonner";

type ApiKeyConfigDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasApiKey: boolean;
  onKeySaved: () => void;
};

export function ApiKeyConfigDialog({
  open,
  onOpenChange,
  hasApiKey,
  onKeySaved,
}: ApiKeyConfigDialogProps) {
  const [apiKeyInput, setApiKeyInput] = useState("");

  async function openLink() {
    try {
      await openUrl("https://www.steamgriddb.com/profile/preferences/api");
    } catch (error) {
      console.error("Failed to open link:", error);
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    try {
      await saveKey(apiKeyInput);
      onKeySaved();
      onOpenChange(false);
      toast.success("API Key saved successfully");
    } catch (error) {
      toast.error("Failed to save API Key");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>SteamGridDB Configuration</DialogTitle>
          <DialogDescription>
            Enter your personal API key to enable cover art searching.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!hasApiKey && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>API Key Missing</AlertTitle>
              <AlertDescription>
                You must provide an API key to search for artwork.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="apikey">API Key</Label>
            <div className="relative">
              <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="apikey"
                type="password"
                placeholder="Paste your key here..."
                className="pl-9"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
            </div>
          </div>
          <p className="text-[0.8rem] text-muted-foreground">
            You can generate a key in your{" "}
            <Button variant="link" onClick={openLink} className="p-0 h-auto">
              SteamGridDB Profile
            </Button>
            .
          </p>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSaveApiKey}>
            Save Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

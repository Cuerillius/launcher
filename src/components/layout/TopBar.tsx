import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";
import { Button } from "../ui/button";

export default function TopBar() {
  const [appWindow, setAppWindow] = useState<any>(null);

  useEffect(() => {
    setAppWindow(getCurrentWindow());
  }, []);

  const handleMinimize = () => appWindow?.minimize();
  const handleMaximize = () => appWindow?.toggleMaximize();
  const handleClose = () => appWindow?.close();

  return (
    <>
      <div className="absolute top-2 right-2 border-l-2 border-b-2 border-border rounded-bl-2xl rounded-tr-2xl p-1.5 z-35 w-24 h-8 pointer-events-none" />
      <div className="absolute top-0 right-0 bg-sidebar border-border rounded-bl-2xl rounded-tr-2xl p-1.5 z-30">
        <div className="flex items-center gap-1">
          <Button
            onClick={handleMinimize}
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
            aria-label="Minimize"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleMaximize}
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
            aria-label="Maximize"
          >
            <Square className="!w-3.5 !h-3.5" />
          </Button>
          <Button
            id="close"
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:!bg-destructive hover:!text-destructive-foreground rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

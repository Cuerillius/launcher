import { createRootRoute, Outlet } from "@tanstack/react-router";
import TopBar from "@/components/layout/TopBar";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/layout/Sidebar";

export const Route = createRootRoute({
  component: RootComponent,
});

export default function RootComponent() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-sidebar text-foreground">
      <Sidebar />
      <TopBar />
      <div
        data-tauri-drag-region
        className="absolute top-0 left-0 w-full h-5 z-20"
      />
      <main className="flex flex-1 flex-col p-2 overflow-hidden">
        <div className="flex-1 w-full h-full overflow-auto rounded-2xl border-2 border-border shadow-sm bg-background">
          <Toaster position="top-right" className="z-10!" />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

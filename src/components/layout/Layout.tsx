import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Executable } from "../../types/Executable";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import { getAllExecutables } from "@/services/executables";
import { Toaster } from "../ui/sonner";

export default function Layout() {
  const [list, setList] = useState<Executable[]>([]);

  const fetchExecutables = async (): Promise<void> => {
    const executables = await getAllExecutables();
    setList(executables);
  };

  useEffect(() => {
    fetchExecutables();
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-sidebar text-foreground">
      <Sidebar executables={list} />
      <TopBar />
      <div
        data-tauri-drag-region
        className="absolute top-0 left-0 w-full h-5 z-20"
      />
      <main className="flex flex-1 flex-col p-2 overflow-hidden">
        <Toaster position="top-right" className="z-10!" />
        <div className="flex-1 w-full h-full overflow-auto rounded-2xl border-2 border-border shadow-sm bg-background">
          <Outlet
            context={{ executables: list, refreshList: fetchExecutables }}
          />
        </div>
      </main>
    </div>
  );
}

import { LayoutGrid, PanelLeft, Plus, Search } from "lucide-react";

import { Executable } from "@/types/Executable";
import { useState, useMemo } from "react";

import { cn } from "@/lib/utils";
import { Logo } from "@/assets/Logo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { ExecutableIcon } from "../display/ExecutableImage";
import { useAppNavigation } from "@/hooks/useAppNavigation";

function Sidebar({ executables }: { executables: Executable[] }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { goHome, goGrid, goExecutable, goAdd } = useAppNavigation();
  const filteredExecutables = useMemo(() => {
    if (!searchTerm) return executables;
    return executables.filter((exe) =>
      exe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [executables, searchTerm]);

  return (
    <div
      data-collapsed={isCollapsed}
      className={cn(
        "relative flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out",
        "bg-sidebar text-sidebar-foreground border-sidebar-border",
        isCollapsed ? "w-[70px]" : "w-72"
      )}
    >
      <div className="flex flex-col gap-4 p-4 pb-2 shrink-0">
        <div
          className={cn(
            "flex items-center justify-between w-full",
            isCollapsed && "flex-col gap-4"
          )}
        >
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={goHome}
          >
            <div className="shrink-0 text-sidebar-foreground">
              <Logo />
            </div>
            {!isCollapsed && (
              <h1 className="font-bold text-lg tracking-tight text-sidebar-foreground">
                Omni
              </h1>
            )}
          </div>

          <div
            className={cn(
              "flex items-center gap-1",
              isCollapsed ? "flex-col" : "flex-row"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={goGrid}
            >
              <LayoutGrid className="size-4" />
              <span className="sr-only">Open Grid</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <PanelLeft className="size-4" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search..."
              className="pl-8 h-9 bg-sidebar-accent/50 border-sidebar-border focus-visible:ring-sidebar-ring placeholder:text-muted-foreground text-sidebar-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0 px-2 py-2">
        <div className="flex flex-col gap-1 pb-2">
          {filteredExecutables.map((executable) => (
            <Button
              key={executable.id}
              variant="ghost"
              className={cn(
                "flex w-full items-center h-10 group overflow-hidden",
                isCollapsed ? "justify-center px-0" : "justify-start px-2",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "text-muted-foreground"
              )}
              onClick={() => goExecutable(executable.id)}
            >
              <div className="shrink-0 flex items-center justify-center text-current group-hover:text-sidebar-accent-foreground transition-colors">
                <ExecutableIcon executable={executable} />
              </div>
              {!isCollapsed && (
                <span
                  className="ml-3 text-sm font-medium truncate text-left flex-1 transition-colors"
                  title={executable.name}
                >
                  {executable.name}
                </span>
              )}
            </Button>
          ))}

          {filteredExecutables.length === 0 && searchTerm && !isCollapsed && (
            <div className="text-sm text-muted-foreground text-center py-4">
              Nothing here :(
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="mx-4 h-px bg-sidebar-border" />
      <div className="p-4 mt-auto border-sidebar-border shrink-0">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 px-2",
            "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isCollapsed && "justify-center px-0"
          )}
          onClick={goAdd}
        >
          <div className="flex items-center justify-center rounded-md bg-sidebar-accent p-1 text-sidebar-accent-foreground">
            <Plus className="size-4" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-sm">Add Executable</span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default Sidebar;

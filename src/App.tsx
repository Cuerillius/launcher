import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";

type Platform =
  | "Steam"
  | "Epic"
  | "Xbox"
  | "PlayStation"
  | "Nintendo"
  | "GOG"
  | "Pirated"
  | { Other: string };

interface Executable {
  id: string;
  name: string;
  path?: string | null;
  args?: string[] | null;
  icon?: string | null;
  logo?: string | null;
  banner?: string | null;
  grid?: string | null;
  playtime?: number | null;
  platform: Platform;
}

function App() {
  const [executables, setExecutables] = useState<Executable[]>([]);

  useEffect(() => {
    invoke<Executable[]>("get_all_executables").then(setExecutables);
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <Button>Click me</Button>
      <div>
        <h2 className="font-bold mb-2">Executables:</h2>
        <ul>
          {executables.map((exe) => (
            <li key={exe.id}>{exe.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

import { Executable } from "@/types/Executable";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";

export async function getAllExecutables(): Promise<Executable[]> {
  const rawExecutables = await invoke<Executable[]>("get_all_executables");

  return rawExecutables.map((exe) => ({
    ...exe,
    icon: exe.icon
      ? { path: convertFileSrc(exe.icon.path), source: exe.icon.source }
      : undefined,
    logo: exe.logo
      ? { path: convertFileSrc(exe.logo.path), source: exe.logo.source }
      : undefined,
    banner: exe.banner
      ? { path: convertFileSrc(exe.banner.path), source: exe.banner.source }
      : undefined,
    grid: exe.grid
      ? { path: convertFileSrc(exe.grid.path), source: exe.grid.source }
      : undefined,
  }));
}

export async function deleteExecutable(id: string): Promise<void> {
  await invoke("delete_executable", { id });
}

export async function launchExecutable(id: string): Promise<void> {
  await invoke("launch_executable", { id });
}

export async function stopExecutable(id: string): Promise<void> {
  await invoke("stop_executable", { id });
}

export async function getRunningExecutables(): Promise<string[]> {
  return await invoke<string[]>("get_running_executables");
}

export async function saveExecutable(executable: Executable): Promise<void> {
  await invoke("save_executable", { executable });
}

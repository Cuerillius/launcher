import { Executable } from "@/types/Executable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";

export function useExecutable(id: string) {
  return useQuery({
    queryKey: ["executables", "detail", id],
    queryFn: async () => {
      const executable = await invoke<Executable>("get_executable", { id });
      return {
        ...executable,
        icon: executable.icon
          ? {
              path: convertFileSrc(executable.icon.path),
              source: executable.icon.source,
            }
          : undefined,
        logo: executable.logo
          ? {
              path: convertFileSrc(executable.logo.path),
              source: executable.logo.source,
            }
          : undefined,
        banner: executable.banner
          ? {
              path: convertFileSrc(executable.banner.path),
              source: executable.banner.source,
            }
          : undefined,
        grid: executable.grid
          ? {
              path: convertFileSrc(executable.grid.path),
              source: executable.grid.source,
            }
          : undefined,
      };
    },
  });
}

export function useSaveExecutable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedData: Executable) => {
      return await invoke("save_executable", { executable: updatedData });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["executables", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["executables", "detail", variables.id],
      });
    },
  });
}

export function useDeleteExecutable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await invoke("delete_executable", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executables", "list"] });
    },
  });
}

export function useRunningExecutables() {
  return useQuery({
    queryKey: ["executables", "running"],
    queryFn: async () => {
      return await invoke<string[]>("get_running_executables");
    },
  });
}

export function useLaunchExecutable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await invoke("launch_executable", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executables", "running"] });
    },
  });
}

export function useAllExecutables() {
  return useQuery<Executable[], Error>({
    queryKey: ["executables", "list"],
    queryFn: async () => {
      const executables = await invoke<Executable[]>("get_all_executables");
      return executables.map((exe) => ({
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
    },
  });
}

import { handleGetArtworks, handleSearch } from "@/services/artworkService";
import { Executable } from "@/types/Executable";
import { ScanResult, ScanResultSelection } from "@/types/Import";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export function useScanFolderForExes(rootPath: string) {
  return useQuery({
    queryKey: ["executables", "detail", rootPath],
    queryFn: async () => {
      return await invoke<ScanResult[]>("scan_folder_for_exes", { rootPath });
    },
  });
}

export async function convertScanResultToExecutable(
  selection: ScanResultSelection
): Promise<Executable | null> {
  const results = await handleSearch(selection.name);

  if (results.length === 0) {
    return {
      id: crypto.randomUUID(),
      name: selection.name,
      path: selection.executable,
    };
  }

  const id = results[0].id;
  const artworks = await handleGetArtworks(id);

  const executable: Executable = {
    id: crypto.randomUUID(),
    name: results[0].name,
    path: selection.executable,
    banner:
      artworks.heroes && artworks.heroes.length > 0
        ? { source: artworks.heroes[0], path: artworks.heroes[0].path }
        : undefined,
    icon:
      artworks.icons && artworks.icons.length > 0
        ? { source: artworks.icons[0], path: artworks.icons[0].path }
        : undefined,
    grid:
      artworks.grids && artworks.grids.length > 0
        ? { source: artworks.grids[0], path: artworks.grids[0].path }
        : undefined,
    logo:
      artworks.logos && artworks.logos.length > 0
        ? { source: artworks.logos[0], path: artworks.logos[0].path }
        : undefined,
  };

  return executable;
}

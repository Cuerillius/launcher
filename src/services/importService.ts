import { ScanResult } from "@/types/Import";
import { invoke } from "@tauri-apps/api/core";

export async function scanFolderForExes(
  rootPath: string
): Promise<ScanResult[]> {
  return await invoke<ScanResult[]>("scan_folder_for_exes", {
    rootPath,
  });
}

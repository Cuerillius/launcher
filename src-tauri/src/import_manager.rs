use serde::Serialize;
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

#[derive(Serialize)]
pub struct AppGroup {
    name: String,
    executables: Vec<String>,
}

fn find_executables_recursively(path: &Path) -> Vec<String> {
    let mut executables = Vec::new();

    for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
        let entry_path = entry.path();

        if entry_path.is_file() {
            if let Some(extension) = entry_path.extension() {
                if extension.to_string_lossy().to_lowercase() == "exe" {
                    executables.push(entry_path.to_string_lossy().to_string());
                }
            }
        }
    }

    executables
}

#[tauri::command]
pub fn scan_folder_for_exes(root_path: String) -> Result<Vec<AppGroup>, String> {
    let root = Path::new(&root_path);

    if !root.exists() || !root.is_dir() {
        return Err(format!(
            "The path '{}' does not exist or is not a directory.",
            root_path
        ));
    }

    let mut results = Vec::new();

    let entries = fs::read_dir(root).map_err(|e| e.to_string())?;

    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_dir() {
                let name = path
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string();
                let executables = find_executables_recursively(&path);

                if !executables.is_empty() {
                    results.push(AppGroup { name, executables });
                }
            }
        }
    }

    Ok(results)
}

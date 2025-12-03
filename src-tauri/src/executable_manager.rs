use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs;
use std::path::Path;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use std::{collections::HashMap, process::Command};
use sysinfo::{Pid, System};
use tauri::{AppHandle, Manager, State};

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub enum Platform {
    Steam,
    Epic,
    Xbox,
    PlayStation,
    Nintendo,
    GOG,
    VR,
    Pirated,
    Unknown,
    Other,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Executable {
    pub id: uuid::Uuid,
    pub name: String,
    pub path: Option<String>,
    pub args: Option<Vec<String>>,
    pub icon: Option<String>,
    pub logo: Option<String>,
    pub banner: Option<String>,
    pub grid: Option<String>,
    pub playtime: Option<u64>,
    pub platform: Option<Platform>,
    pub lastLaunched: Option<u64>,
}

pub struct LauncherState {
    pub running_processes: Arc<Mutex<HashMap<String, Vec<u32>>>>,
}
#[tauri::command]
pub async fn save_executable(app: AppHandle, mut executable: Executable) -> Result<(), String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let exe_dir = app_dir.join("executables").join(executable.id.to_string());
    let resources_dir = exe_dir.join("resources");

    fs::create_dir_all(&resources_dir).map_err(|e| e.to_string())?;

    executable.icon = handle_resource(&executable.icon, &resources_dir, "icon").await?;
    executable.logo = handle_resource(&executable.logo, &resources_dir, "logo").await?;
    executable.banner = handle_resource(&executable.banner, &resources_dir, "banner").await?;
    executable.grid = handle_resource(&executable.grid, &resources_dir, "grid").await?;

    let json_path = exe_dir.join("data.json");
    let json_data = serde_json::to_string_pretty(&executable).map_err(|e| e.to_string())?;

    fs::write(json_path, json_data).map_err(|e| e.to_string())?;

    Ok(())
}

async fn handle_resource(
    source: &Option<String>,
    target_dir: &Path,
    base_name: &str,
) -> Result<Option<String>, String> {
    let src_str = match source {
        Some(s) if !s.is_empty() => s,
        _ => return Ok(None),
    };

    let extension = get_extension(src_str).unwrap_or_else(|| "png".to_string());
    let file_name = format!("{}.{}", base_name, extension);
    let dest_path = target_dir.join(&file_name);

    if src_str.starts_with("asset:")
        || src_str.starts_with("http://asset.localhost")
        || src_str.starts_with("https://asset.localhost")
    {
        return Ok(Some(dest_path.to_string_lossy().to_string()));
    } else if src_str.starts_with("http") {
        let response = reqwest::get(src_str)
            .await
            .map_err(|e| format!("Download failed: {}", e))?;

        let bytes = response
            .bytes()
            .await
            .map_err(|e| format!("Failed to read bytes: {}", e))?;

        fs::write(&dest_path, bytes).map_err(|e| e.to_string())?;
    } else {
        let src_path = Path::new(src_str);
        if src_path.exists() {
            fs::copy(src_path, &dest_path).map_err(|e| e.to_string())?;
        } else {
            return Ok(None);
        }
    }

    Ok(Some(dest_path.to_string_lossy().to_string()))
}

fn get_extension(path_str: &str) -> Option<String> {
    let clean_path = path_str.split('?').next().unwrap_or(path_str);
    Path::new(clean_path)
        .extension()
        .and_then(|os_str| os_str.to_str())
        .map(|s| s.to_lowercase())
}

#[tauri::command]
pub async fn delete_executable(app: AppHandle, id: uuid::Uuid) -> Result<(), String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let exe_dir = app_dir.join("executables").join(id.to_string());

    if exe_dir.exists() {
        fs::remove_dir_all(exe_dir).map_err(|e| format!("Failed to delete executable: {}", e))?;
    } else {
        return Err("Executable not found".to_string());
    }

    Ok(())
}

#[tauri::command]
pub async fn get_all_executables(app: AppHandle) -> Result<Vec<Executable>, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let executables_dir = app_dir.join("executables");

    let mut executables = Vec::new();

    if !executables_dir.exists() {
        return Ok(executables);
    }

    let entries = fs::read_dir(executables_dir).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_dir() {
            let json_path = path.join("data.json");
            if json_path.exists() {
                if let Ok(data) = fs::read_to_string(&json_path) {
                    if let Ok(mut exe) = serde_json::from_str::<Executable>(&data) {
                        let resolve = |p: Option<String>| -> Option<String> {
                            p.map(|s| path.join(s).to_string_lossy().to_string())
                        };

                        exe.icon = resolve(exe.icon);
                        exe.logo = resolve(exe.logo);
                        exe.banner = resolve(exe.banner);
                        exe.grid = resolve(exe.grid);

                        executables.push(exe);
                    }
                }
            }
        }
    }

    println!(
        "Found executables: {:?}",
        executables.iter().map(|e| &e.name).collect::<Vec<_>>()
    );

    Ok(executables)
}
#[tauri::command]
pub async fn launch_executable(
    app: AppHandle,
    state: State<'_, LauncherState>,
    id: uuid::Uuid,
) -> Result<(), String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    let json_path = app_dir
        .join("executables")
        .join(id.to_string())
        .join("data.json");

    if !json_path.exists() {
        return Err("Config not found".to_string());
    }

    let data = fs::read_to_string(&json_path).map_err(|e| e.to_string())?;
    let exe: Executable = serde_json::from_str(&data).map_err(|e| e.to_string())?;

    let path_str = exe.path.as_deref().unwrap_or("").trim();
    if path_str.is_empty() {
        return Err("Path not set".to_string());
    }
    let path = Path::new(path_str);
    if !path.exists() {
        return Err("File not found".to_string());
    }

    let mut cmd = Command::new(path);
    if let Some(args) = exe.args {
        cmd.args(args);
    }
    if let Some(parent) = path.parent() {
        cmd.current_dir(parent);
    }

    let child = cmd
        .spawn()
        .map_err(|e| format!("Failed to launch: {}", e))?;

    let initial_pid = child.id();
    let game_id = exe.id.to_string();

    {
        let mut running_map = state
            .running_processes
            .lock()
            .map_err(|_| "Lock failed".to_string())?;
        running_map.insert(game_id.clone(), vec![initial_pid]);
    }
    let pid_tracker = state.running_processes.clone();

    tauri::async_runtime::spawn(async move {
        monitor_process(pid_tracker, game_id, initial_pid, json_path).await;
    });

    Ok(())
}
async fn monitor_process(
    process_map: Arc<Mutex<HashMap<String, Vec<u32>>>>,
    game_id: String,
    initial_pid: u32,
    json_path: std::path::PathBuf,
) {
    let mut sys = System::new_all();

    let mut tracked_pids: HashSet<Pid> = HashSet::new();
    tracked_pids.insert(Pid::from_u32(initial_pid));

    let mut last_save_time = std::time::Instant::now();

    loop {
        tokio::time::sleep(Duration::from_secs(2)).await;
        sys.refresh_all();

        let mut new_children = Vec::new();
        for (pid, process) in sys.processes() {
            if let Some(parent) = process.parent() {
                if tracked_pids.contains(&parent) && !tracked_pids.contains(pid) {
                    new_children.push(*pid);
                }
            }
        }

        for child in new_children {
            println!("Found new child process: {}", child);
            tracked_pids.insert(child);
        }

        tracked_pids.retain(|&pid| sys.process(pid).is_some());

        {
            if let Ok(mut map) = process_map.lock() {
                if tracked_pids.is_empty() {
                    map.remove(&game_id);
                } else {
                    let pid_list: Vec<u32> = tracked_pids.iter().map(|p| p.as_u32()).collect();
                    map.insert(game_id.clone(), pid_list);
                }
            }
        }

        if last_save_time.elapsed().as_secs() >= 300 {
            let seconds_passed = last_save_time.elapsed().as_secs();
            update_playtime_on_disk(&json_path, seconds_passed);
            last_save_time = std::time::Instant::now();
        }

        if tracked_pids.is_empty() {
            let seconds_passed = last_save_time.elapsed().as_secs();
            if seconds_passed > 0 {
                update_playtime_on_disk(&json_path, seconds_passed);
            }
            break;
        }
    }
}
#[tauri::command]
pub async fn get_running_executables(
    state: State<'_, LauncherState>,
) -> Result<Vec<uuid::Uuid>, String> {
    let map = state
        .running_processes
        .lock()
        .map_err(|_| "Failed to lock state".to_string())?;

    let ids = map
        .keys()
        .filter_map(|k| uuid::Uuid::parse_str(k).ok())
        .collect();

    Ok(ids)
}
#[tauri::command]
pub async fn stop_executable(
    state: State<'_, LauncherState>,
    id: uuid::Uuid,
) -> Result<(), String> {
    let game_id = id.to_string();

    let pids_to_kill: Option<Vec<u32>> = {
        let map = state
            .running_processes
            .lock()
            .map_err(|_| "Failed to lock state".to_string())?;

        map.get(&game_id).cloned()
    };

    if let Some(pids) = pids_to_kill {
        let s = System::new_all();

        for pid_u32 in pids {
            let pid = Pid::from_u32(pid_u32);

            if let Some(process) = s.process(pid) {
                if process.kill() {
                    println!("Killed process: {}", pid_u32);
                } else {
                    println!(
                        "Failed to kill process (might already be dead): {}",
                        pid_u32
                    );
                }
            }
        }
        let mut map = state
            .running_processes
            .lock()
            .map_err(|_| "Failed to lock state".to_string())?;

        map.remove(&game_id);
    } else {
        return Err("Game is not currently running".to_string());
    }

    Ok(())
}

fn update_playtime_on_disk(json_path: &Path, seconds_to_add: u64) {
    if let Ok(data) = fs::read_to_string(json_path) {
        if let Ok(mut exe) = serde_json::from_str::<Executable>(&data) {
            let current_minutes = exe.playtime.unwrap_or(0);
            let minutes_to_add = seconds_to_add / 60;
            if minutes_to_add > 0 {
                exe.playtime = Some(current_minutes + minutes_to_add);

                if let Ok(json) = serde_json::to_string_pretty(&exe) {
                    let _ = fs::write(json_path, json);
                }
            }
        }
    }
}

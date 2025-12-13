use base64::{engine::general_purpose, Engine as _};
use chrono::Utc;
use color_thief::ColorFormat;
use serde::{Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use sysinfo::{Pid, System};
use tauri::{AppHandle, Manager, State};
use uuid::Uuid;

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

#[derive(Serialize_repr, Deserialize_repr, Debug, Clone, PartialEq)]
#[repr(u8)]
pub enum ArtworkProvider {
    STEAMGRIDDB = 0,
    LOCAL = 1,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ArtworkResource {
    pub remote_id: i64,
    pub provider: ArtworkProvider,
    pub path: String,
    pub thumb: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Artwork {
    pub path: String,
    pub source: ArtworkResource,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Executable {
    pub id: Uuid,
    pub name: String,
    pub path: Option<String>,
    pub args: Option<Vec<String>>,
    pub icon: Option<Artwork>,
    pub logo: Option<Artwork>,
    pub banner: Option<Artwork>,
    pub grid: Option<Artwork>,
    pub playtime: Option<f64>,
    pub platform: Option<Platform>,
    pub last_launched: Option<i64>,
    pub colors: Option<Vec<String>>,
}

pub struct LauncherState {
    pub running_processes: Arc<Mutex<HashMap<String, Vec<u32>>>>,
}

#[tauri::command]
pub async fn save_executable(app: AppHandle, mut executable: Executable) -> Result<(), String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let exe_dir = app_dir.join("executables").join(executable.id.to_string());
    let resources_dir = exe_dir.join("resources");
    let json_path = exe_dir.join("data.json");

    fs::create_dir_all(&resources_dir).map_err(|e| e.to_string())?;

    let old_executable: Option<Executable> = if json_path.exists() {
        fs::read_to_string(&json_path)
            .ok()
            .and_then(|data| serde_json::from_str(&data).ok())
    } else {
        None
    };

    let get_old_art = |exe: &Option<Executable>,
                       selector: fn(&Executable) -> &Option<Artwork>|
     -> Option<Artwork> { exe.as_ref().and_then(|x| selector(x).clone()) };

    executable.icon = handle_resource(
        &executable.icon,
        &get_old_art(&old_executable, |e| &e.icon),
        &resources_dir,
        "icon",
    )
    .await?;
    executable.logo = handle_resource(
        &executable.logo,
        &get_old_art(&old_executable, |e| &e.logo),
        &resources_dir,
        "logo",
    )
    .await?;

    executable.banner = handle_resource(
        &executable.banner,
        &get_old_art(&old_executable, |e| &e.banner),
        &resources_dir,
        "banner",
    )
    .await?;

    executable.grid = handle_resource(
        &executable.grid,
        &get_old_art(&old_executable, |e| &e.grid),
        &resources_dir,
        "grid",
    )
    .await?;

    if let Some(banner) = &executable.banner {
        let full_banner_path = exe_dir.join(&banner.path);
        if full_banner_path.exists() {
            let colors = get_dominant_colors(&full_banner_path, 5).map_err(|e| {
                format!(
                    "Failed to extract colors: {} | Path: {:?}",
                    e, full_banner_path
                )
            })?;
            executable.colors = Some(colors);
        } else {
            if let Some(old) = &old_executable {
                executable.colors = old.colors.clone();
            }
        }
    }

    let json_data = serde_json::to_string_pretty(&executable).map_err(|e| e.to_string())?;
    fs::write(json_path, json_data).map_err(|e| e.to_string())?;

    Ok(())
}
async fn handle_resource(
    new_artwork_opt: &Option<Artwork>,
    old_artwork_opt: &Option<Artwork>,
    target_dir: &Path,
    base_name: &str,
) -> Result<Option<Artwork>, String> {
    let mut artwork = match new_artwork_opt {
        Some(a) => a.clone(),
        None => return Ok(None),
    };

    let src_str = &artwork.source.path;

    if src_str.is_empty() {
        return Ok(None);
    }

    let extension = if src_str.starts_with("data:image") {
        get_extension_from_base64(src_str).unwrap_or_else(|| "png".to_string())
    } else {
        get_extension(src_str).unwrap_or_else(|| "png".to_string())
    };

    let file_name = format!("{}.{}", base_name, extension);
    let dest_path = target_dir.join(&file_name);
    let relative_path = format!("resources/{}", file_name);

    if let Some(old_artwork) = old_artwork_opt {
        if old_artwork.source.path == artwork.source.path && dest_path.exists() {
            artwork.path = relative_path;
            return Ok(Some(artwork));
        }
    }

    match artwork.source.provider {
        ArtworkProvider::STEAMGRIDDB => {
            if src_str.starts_with("http://") || src_str.starts_with("https://") {
                if !src_str.contains("asset.localhost") {
                    let response = reqwest::get(src_str)
                        .await
                        .map_err(|e| format!("Download failed: {}", e))?;
                    let bytes = response
                        .bytes()
                        .await
                        .map_err(|e| format!("Failed to read bytes: {}", e))?;
                    fs::write(&dest_path, bytes).map_err(|e| e.to_string())?;
                }
            }
        }
        ArtworkProvider::LOCAL => {
            if src_str.starts_with("data:image") {
                if let Some(comma_index) = src_str.find(',') {
                    let base64_data = &src_str[comma_index + 1..];
                    let decoded = general_purpose::STANDARD
                        .decode(base64_data)
                        .map_err(|e| format!("Base64 decode failed: {}", e))?;
                    fs::write(&dest_path, decoded).map_err(|e| e.to_string())?;
                }
            } else {
                let src_path = Path::new(src_str);

                if src_path.exists() {
                    let abs_src = fs::canonicalize(src_path).unwrap_or_default();
                    let abs_dest =
                        fs::canonicalize(&dest_path).unwrap_or_else(|_| dest_path.clone());

                    if abs_src != abs_dest {
                        fs::copy(src_path, &dest_path).map_err(|e| e.to_string())?;
                    }
                }
            }
        }
    }

    artwork.path = relative_path;

    Ok(Some(artwork))
}

fn get_extension_from_base64(data: &str) -> Option<String> {
    if data.starts_with("data:image/") {
        let end = data.find(';')?;
        let ext = &data[11..end];
        return Some(ext.to_string());
    }
    None
}

fn get_extension(path_str: &str) -> Option<String> {
    Path::new(path_str)
        .extension()
        .and_then(|os_str| os_str.to_str())
        .map(|s| s.to_string())
}

fn get_dominant_colors(path: &std::path::Path, count: u8) -> Result<Vec<String>, String> {
    let img = image::open(path).map_err(|e| format!("Image open error: {}", e))?;
    let rgb_img = img.to_rgb8();
    let buffer = rgb_img.as_raw();

    let palette = color_thief::get_palette(buffer, ColorFormat::Rgb, 10, count)
        .map_err(|e| format!("Color thief error: {:?}", e))?;

    let hex_colors: Vec<String> = palette
        .into_iter()
        .map(|color| format!("#{:02x}{:02x}{:02x}", color.r, color.g, color.b))
        .collect();

    Ok(hex_colors)
}

#[tauri::command]
pub async fn delete_executable(app: AppHandle, id: Uuid) -> Result<(), String> {
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
                        let resolve_artwork = |mut art: Artwork| -> Artwork {
                            let p = Path::new(&art.path);
                            if p.is_relative() {
                                art.path = path.join(p).to_string_lossy().to_string();
                            }
                            art
                        };

                        exe.icon = exe.icon.map(resolve_artwork);
                        exe.logo = exe.logo.map(resolve_artwork);
                        exe.banner = exe.banner.map(resolve_artwork);
                        exe.grid = exe.grid.map(resolve_artwork);

                        executables.push(exe);
                    }
                }
            }
        }
    }

    Ok(executables)
}

#[tauri::command]
pub async fn get_executable(app: AppHandle, id: String) -> Result<Executable, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    let specific_dir = app_dir.join("executables").join(&id);
    let json_path = specific_dir.join("data.json");

    if !json_path.exists() {
        return Err(format!("Executable with ID '{}' not found.", id));
    }

    let data = fs::read_to_string(&json_path).map_err(|e| e.to_string())?;
    let mut exe = serde_json::from_str::<Executable>(&data).map_err(|e| e.to_string())?;

    let resolve_artwork = |mut art: Artwork| -> Artwork {
        let p = Path::new(&art.path);
        if p.is_relative() {
            art.path = specific_dir.join(p).to_string_lossy().to_string();
        }
        art
    };

    exe.icon = exe.icon.map(resolve_artwork);
    exe.logo = exe.logo.map(resolve_artwork);
    exe.banner = exe.banner.map(resolve_artwork);
    exe.grid = exe.grid.map(resolve_artwork);

    Ok(exe)
}

#[tauri::command]
pub async fn launch_executable(
    app: AppHandle,
    state: State<'_, LauncherState>,
    id: Uuid,
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

    update_playtime_on_disk(&json_path, 0);

    tauri::async_runtime::spawn(async move {
        monitor_process(pid_tracker, game_id, initial_pid, json_path).await;
    });

    Ok(())
}

async fn monitor_process(
    process_map: Arc<Mutex<HashMap<String, Vec<u32>>>>,
    game_id: String,
    initial_pid: u32,
    json_path: PathBuf,
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

        let seconds_passed = last_save_time.elapsed().as_secs();
        if seconds_passed >= 60 {
            update_playtime_on_disk(&json_path, seconds_passed);
            last_save_time = std::time::Instant::now();
        }

        if tracked_pids.is_empty() {
            if last_save_time.elapsed().as_secs() > 0 {
                update_playtime_on_disk(&json_path, last_save_time.elapsed().as_secs());
            }
            break;
        }
    }
}

fn update_playtime_on_disk(json_path: &Path, seconds_to_add: u64) {
    if let Ok(data) = fs::read_to_string(json_path) {
        if let Ok(mut exe) = serde_json::from_str::<Executable>(&data) {
            let current_minutes = exe.playtime.unwrap_or(0.0);
            let minutes_to_add = seconds_to_add as f64 / 60.0;

            if minutes_to_add > 0.0 {
                exe.playtime = Some(current_minutes + minutes_to_add);
            }

            exe.last_launched = Some(Utc::now().timestamp_millis());

            if let Ok(json) = serde_json::to_string_pretty(&exe) {
                let _ = fs::write(json_path, json);
            }
        }
    }
}

#[tauri::command]
pub async fn get_running_executables(state: State<'_, LauncherState>) -> Result<Vec<Uuid>, String> {
    let map = state
        .running_processes
        .lock()
        .map_err(|_| "Failed to lock state".to_string())?;
    Ok(map.keys().filter_map(|k| Uuid::parse_str(k).ok()).collect())
}

#[tauri::command]
pub async fn stop_executable(state: State<'_, LauncherState>, id: Uuid) -> Result<(), String> {
    let game_id = id.to_string();
    let pids_to_kill: Option<Vec<u32>> = {
        let map = state
            .running_processes
            .lock()
            .map_err(|_| "Lock failed".to_string())?;
        map.get(&game_id).cloned()
    };

    if let Some(pids) = pids_to_kill {
        let s = System::new_all();
        for pid_u32 in pids {
            if let Some(process) = s.process(Pid::from_u32(pid_u32)) {
                process.kill();
            }
        }
        let mut map = state
            .running_processes
            .lock()
            .map_err(|_| "Lock failed".to_string())?;
        map.remove(&game_id);
    } else {
        return Err("Game is not running".to_string());
    }

    Ok(())
}

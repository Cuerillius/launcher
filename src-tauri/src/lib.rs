// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod executable_manager;
pub mod keystore;
use crate::executable_manager::LauncherState;
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use executable_manager::{
    delete_executable, get_all_executables, get_running_executables, launch_executable,
    save_executable, stop_executable,
};

use keystore::{get_api_key, save_api_key};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        //.plugin(tauri_plugin_prevent_default::init())
        .manage(LauncherState {
            running_processes: Arc::new(Mutex::new(HashMap::new())),
        })
        .invoke_handler(tauri::generate_handler![
            save_executable,
            delete_executable,
            get_all_executables,
            launch_executable,
            get_running_executables,
            stop_executable,
            get_api_key,
            save_api_key
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

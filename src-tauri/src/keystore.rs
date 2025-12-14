use keyring::Entry;

const SERVICE_NAME: &str = "com.cuerillius.launcher.secrets";
const KEY_NAME: &str = "steamgriddb_api_key";

#[tauri::command]
pub fn save_api_key(api_key: String) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, KEY_NAME).map_err(|e| e.to_string())?;
    entry.set_password(&api_key).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_api_key() -> Result<Option<String>, String> {
    let entry = Entry::new(SERVICE_NAME, KEY_NAME).map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(stored_key) => Ok(Some(stored_key)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

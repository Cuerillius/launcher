import { invoke } from "@tauri-apps/api/core";

export async function saveKey(key: string) {
  try {
    await invoke("save_api_key", { apiKey: key });
    console.log("Key saved securely to Keychain!");
  } catch (err) {
    console.error("Failed to save key:", err);
    alert("Could not save to secure storage.");
  }
}

export async function loadKey() {
  try {
    const key = await invoke<string | null>("get_api_key");

    if (key) {
      console.log("Loaded Key:", key);
    } else {
      console.log("No key found. User needs to login.");
    }
    return key;
  } catch (err) {
    console.error("Failed to load key:", err);
    return null;
  }
}

export async function isKeySet() {
  try {
    const key = await loadKey();
    return key !== null && key !== undefined && key !== "";
  } catch (err) {
    console.error("Failed to check if key is set:", err);
    return false;
  }
}

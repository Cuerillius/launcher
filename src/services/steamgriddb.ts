import { fetch } from "@tauri-apps/plugin-http";
import { loadKey } from "./keystore";

export interface SGDBGame {
  id: number;
  name: string;
  types: string[];
  verified: boolean;
}

interface SGDBResponse {
  success: boolean;
  data: SGDBGame[];
}

export async function searchSteamGridDB(query: string): Promise<SGDBGame[]> {
  if (!query) return [];

  const url = `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(
    query
  )}`;

  try {
    const API_KEY = await loadKey();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = (await response.json()) as SGDBResponse;

    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return [];
  }
}

export interface SGDBImage {
  id: number;
  score: number;
  style: string;
  url: string;
  thumb: string;
}

export interface SGDBGameImages {
  grids: SGDBImage[];
  heroes: SGDBImage[];
  logos: SGDBImage[];
  icons: SGDBImage[];
}

interface SGDBImageResponse {
  success: boolean;
  data: SGDBImage[];
}

async function fetchImages(
  type: "grids" | "heroes" | "logos" | "icons",
  gameId: number
): Promise<SGDBImage[]> {
  const url = `https://www.steamgriddb.com/api/v2/${type}/game/${gameId}`;

  try {
    const API_KEY = await loadKey();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = (await response.json()) as SGDBImageResponse;

    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }

    return [];
  } catch (error) {
    console.error(`Failed to fetch ${type}:`, error);
    return [];
  }
}

export async function getGameImages(gameId: number): Promise<SGDBGameImages> {
  const [grids, heroes, logos, icons] = await Promise.all([
    fetchImages("grids", gameId),
    fetchImages("heroes", gameId),
    fetchImages("logos", gameId),
    fetchImages("icons", gameId),
  ]);

  return {
    grids,
    heroes,
    logos,
    icons,
  };
}

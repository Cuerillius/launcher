import { fetch } from "@tauri-apps/plugin-http";
import { loadKey } from "./keystore";
import { ArtworkProvider } from "@/types/Artwork";
import { ArtworkProviderService } from "./artworkService";

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

interface SGDBImage {
  id: number;
  score: number;
  style: string;
  url: string;
  thumb: string;
}

interface SGDBGameImages {
  grids: SGDBImage[];
  heroes: SGDBImage[];
  logos: SGDBImage[];
  icons: SGDBImage[];
}

interface SGDBImageResponse {
  success: boolean;
  data: SGDBImage[];
}

export class SteamGridDBProvider implements ArtworkProviderService {
  readonly name = ArtworkProvider.STEAMGRIDDB;
  private baseUrl = "https://www.steamgriddb.com/api/v2";

  private async searchSteamGridDB(query: string): Promise<SGDBGame[]> {
    if (!query) return [];

    const url = `${this.baseUrl}/search/autocomplete/${encodeURIComponent(
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

  private async fetchImages(
    type: "grids" | "heroes" | "logos" | "icons",
    gameId: number
  ): Promise<SGDBImage[]> {
    const url = `${this.baseUrl}/${type}/game/${gameId}`;
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

  private async getGameImages(gameId: number): Promise<SGDBGameImages> {
    const [grids, heroes, logos, icons] = await Promise.all([
      this.fetchImages("grids", gameId),
      this.fetchImages("heroes", gameId),
      this.fetchImages("logos", gameId),
      this.fetchImages("icons", gameId),
    ]);

    return {
      grids,
      heroes,
      logos,
      icons,
    };
  }

  async search(query: string) {
    return await this.searchSteamGridDB(query);
  }
  async getArtworks(id: number) {
    const images = await this.getGameImages(id);
    const mapImage = (img: SGDBImage) => ({
      remoteId: img.id,
      provider: this.name,
      path: img.url,
      thumb: img.thumb,
    });

    return {
      grids: images.grids.map(mapImage),
      heroes: images.heroes.map(mapImage),
      logos: images.logos.map(mapImage),
      icons: images.icons.map(mapImage),
    };
  }
}

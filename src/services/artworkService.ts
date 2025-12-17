import { ArtworkProvider, ArtworkSet } from "@/types/Artwork";
import { SteamGridDBProvider } from "./provider/steamgriddb";

const CURRENT_PROVIDER_TYPE = "steamgriddb";

export interface SearchResult {
  id: number;
  name: string;
}

export interface ArtworkProviderService {
  name: ArtworkProvider;
  search(query: string): Promise<SearchResult[]>;
  getArtworks(id: number): Promise<ArtworkSet>;
}

function getProvider(): ArtworkProviderService {
  switch (CURRENT_PROVIDER_TYPE) {
    case "steamgriddb":
      return new SteamGridDBProvider();
    default:
      return new SteamGridDBProvider();
  }
}

export async function handleSearch(query: string) {
  const provider = getProvider();
  return await provider.search(query);
}

export async function handleGetArtworks(id: number) {
  const provider = getProvider();
  return await provider.getArtworks(id);
}

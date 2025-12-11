export enum ArtworkProvider {
  STEAMGRIDDB,
  LOCAL,
}

export interface ArtworkResource {
  remoteId: number;
  provider: ArtworkProvider;
  path: string;
  thumb?: string;
}

export interface Artwork {
  path: string;
  source: ArtworkResource;
}

export enum ArtworkRatio {
  Poster = "poster",
  Video = "video",
  Square = "square",
  Logo = "logo",
}

export type ArtworkSet = {
  heroes: ArtworkResource[];
  logos: ArtworkResource[];
  icons: ArtworkResource[];
  grids: ArtworkResource[];
};

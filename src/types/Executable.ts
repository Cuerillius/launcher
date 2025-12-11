import { UUID } from "crypto";
import { Artwork } from "./Artwork";

export enum SourcePlatform {
  Steam = "Steam",
  Epic = "Epic",
  Xbox = "Xbox",
  PlayStation = "PlayStation",
  Nintendo = "Nintendo",
  GOG = "GOG",
  VR = "VR",
  Pirated = "Pirated",
  Unknown = "Unknown",
  Other = "Other",
}
export type Executable = {
  id: UUID;
  name: string;
  path?: string;
  args?: string[];
  icon?: Artwork;
  logo?: Artwork;
  banner?: Artwork;
  grid?: Artwork;
  playtime?: number;
  platform?: SourcePlatform;
  lastLaunched?: number;
};

export type AppContextType = {
  executables: Executable[];
  refreshList: () => Promise<void>;
};

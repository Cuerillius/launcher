export type Executable = {
  id: string
  name: string
  logoPath?: string
  iconPath?: string
  bannerPath?: string
  executablePath?: string
  gridPath?: string
  playtime?: number
  lastLaunched?: number
  platform?: SourcePlatform
}

export enum SourcePlatform {
  Unknown = 'Unknown',
  Steam = 'Steam',
  Epic = 'Epic',
  GOG = 'GOG',
  Piracy = 'Piracy'
}

export type Settings = {
  STEAMGRIDDB_API_KEY: string
}

export type ExecutableStatus = {
  isRunning: boolean
  id: string | null
  startTime: number | null
  pid: number | null
}

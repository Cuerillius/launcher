import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    fs: {
      save: (executable: Executable) => Promise<{ success: boolean; path?: string; error?: string }>
      getAll: () => Promise<Executable[]>
      openFileDialog: () => Promise<string | null>
    }
    executable: {
      launch: (path: string) => void
      stop: () => void
      onExecutableStarted: (callback: (...args: any[]) => void) => void
      onExecutableStopped: (callback: (...args: any[]) => void) => void
      removeListeners: () => void
    }
  }
}

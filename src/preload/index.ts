import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Executable } from '../shared/types'

const api = {}

const fsAPI = {
  save: (executable: Executable) => ipcRenderer.invoke('save-executable', executable),
  getAll: () => ipcRenderer.invoke('get-all-executables'),
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  delete: (executable: Executable) => ipcRenderer.invoke('delete-executable', executable)
}

const executableAPI = {
  launch: (id: string, path: string) => ipcRenderer.send('launch-executable', id, path),

  stop: () => ipcRenderer.send('stop-executable'),

  onExecutableStarted: (callback) =>
    ipcRenderer.on('executable-started', (_event, ...args) => callback(...args)),

  onExecutableStopped: (callback) =>
    ipcRenderer.on('executable-stopped', (_event, ...args) => callback(...args)),

  removeListeners: () => {
    ipcRenderer.removeAllListeners('executable-started')
    ipcRenderer.removeAllListeners('executable-stopped')
  },

  getSettings: () => ipcRenderer.invoke('get-settings'),
  getRunningExecutableStatus: () => ipcRenderer.invoke('get-running-executable-status')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('fs', fsAPI)
    contextBridge.exposeInMainWorld('executable', executableAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.fs = fsAPI
  // @ts-ignore (define in dts)
  window.executable = executableAPI
}

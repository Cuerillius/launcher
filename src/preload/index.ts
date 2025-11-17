import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Executable } from '../shared/types'

// Custom APIs for renderer
const api = {}

const fsAPI = {
  save: (executable: Executable) => ipcRenderer.invoke('save-executable', executable),
  getAll: () => ipcRenderer.invoke('get-all-executables'),
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile')
}

const executableAPI = {
  launch: (path) => ipcRenderer.send('launch-executable', path),

  stop: () => ipcRenderer.send('stop-executable'),

  onExecutableStarted: (callback) =>
    ipcRenderer.on('executable-started', (_event, ...args) => callback(...args)),

  onExecutableStopped: (callback) =>
    ipcRenderer.on('executable-stopped', (_event, ...args) => callback(...args)),

  removeListeners: () => {
    ipcRenderer.removeAllListeners('executable-started')
    ipcRenderer.removeAllListeners('executable-stopped')
  }
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
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
}

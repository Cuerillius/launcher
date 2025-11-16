import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Executable } from '../shared/types'
import { exec } from 'child_process'

// Custom APIs for renderer
const api = {}

const fsAPI = {
  save: (executable: Executable) => ipcRenderer.invoke('save-executable', executable),
  getAll: () => ipcRenderer.invoke('get-all-executables'),
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile')
}

const executableAPI = {
  launch: (path: string) => ipcRenderer.invoke('launch-executable', path)
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

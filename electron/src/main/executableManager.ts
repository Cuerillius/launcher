import { app, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import { ChildProcess, spawn } from 'child_process'
import treeKill from 'tree-kill'
import { Executable, ExecutableStatus, Settings } from '../shared/types'

export class ExecutableManager {
  private gameProcess: ChildProcess | null = null
  private startTime: number | null = null
  private runningExecutableId: string | null = null

  constructor() {
    this.registerIpcHandlers()
  }

  private registerIpcHandlers(): void {
    ipcMain.on('launch-executable', this.launchExecutable.bind(this))
    ipcMain.on('stop-executable', this.stopExecutable.bind(this))
    ipcMain.handle('save-executable', this.saveExecutable.bind(this))
    ipcMain.handle('get-all-executables', this.getAllExecutables.bind(this))
    ipcMain.handle('get-settings', this.getSettings.bind(this))
    ipcMain.handle('dialog:openFile', this.openFileDialog.bind(this))
    ipcMain.handle('delete-executable', this.deleteExecutable.bind(this))

    ipcMain.handle('get-running-executable-status', this.getRunningExecutableStatus.bind(this))

    app.on('before-quit', this.handleBeforeQuit.bind(this))
  }

  private getRunningExecutableStatus(): ExecutableStatus {
    return {
      isRunning: !!this.gameProcess,
      id: this.runningExecutableId,
      startTime: this.startTime,
      pid: this.gameProcess?.pid || null
    }
  }

  private launchExecutable(event: Electron.IpcMainEvent, id: string, executablePath: string): void {
    if (this.gameProcess) {
      console.log('An executable is already running.')
      event.sender.send('executable-already-running')
      return
    }

    try {
      const gameExecutable = path.basename(executablePath)
      const gameDirectory = path.dirname(executablePath)

      this.gameProcess = spawn(gameExecutable, [], {
        cwd: gameDirectory,
        detached: true,
        stdio: 'ignore'
      })

      this.startTime = Date.now()
      this.runningExecutableId = id

      console.log(`Executable process started with PID: ${this.gameProcess.pid}`)
      event.sender.send('executable-started', this.gameProcess.pid)

      this.gameProcess.on('error', (err) => {
        console.error('Failed to start executable process:', err)
        event.sender.send('executable-start-error', err.message)
        this.resetState()
      })

      this.gameProcess.on('exit', async (code) => {
        console.log(`Executable process exited with code: ${code}`)

        await this.handleGameExit()

        if (!event.sender.isDestroyed()) {
          event.sender.send('executable-stopped')
        }

        this.resetState()
      })
    } catch (error: any) {
      console.error('Error trying to spawn executable:', error)
      event.sender.send('executable-start-error', error.message)
      this.resetState()
    }
  }

  private resetState() {
    this.gameProcess = null
    this.startTime = null
    this.runningExecutableId = null
  }

  private async handleGameExit(): Promise<void> {
    if (!this.runningExecutableId || !this.startTime) return

    const endTime = Date.now()
    const durationMs = endTime - this.startTime
    const durationMinutes = Math.max(0, Math.round(durationMs / 1000 / 60))

    try {
      await this.updateExecutableMetadata(this.runningExecutableId, durationMinutes)
    } catch (error) {
      console.error('Failed to update executable metadata on exit:', error)
    }
  }

  private async updateExecutableMetadata(id: string, minutesToAdd: number): Promise<void> {
    const executablesPath = path.join(app.getPath('userData'), 'executables')
    const executableDir = path.join(executablesPath, id)
    const dataFilePath = path.join(executableDir, 'data.json')

    if (!fs.existsSync(dataFilePath)) return

    try {
      const data = await fs.promises.readFile(dataFilePath, 'utf-8')
      const executableData: Executable = JSON.parse(data)

      executableData.playtime = (executableData.playtime || 0) + minutesToAdd
      executableData.lastLaunched = Date.now()

      await fs.promises.writeFile(dataFilePath, JSON.stringify(executableData, null, 2))
    } catch (error) {
      console.error(`Error updating metadata for executable ${id}:`, error)
    }
  }

  private stopExecutable(event: Electron.IpcMainEvent): void {
    if (!this.gameProcess || !this.gameProcess.pid) {
      console.log('No executable process to stop.')
      event.sender.send('no-executable-running')
      return
    }

    console.log(`Attempting to kill executable process tree with PID: ${this.gameProcess.pid}`)

    treeKill(this.gameProcess.pid, 'SIGKILL', (err) => {
      if (err) {
        console.error('Error killing game process tree:', err)
        event.sender.send('game-stop-error', err.message)
      } else {
        console.log('Executable process tree killed successfully.')
      }
    })
  }

  private async getSettings(): Promise<Settings | {}> {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json')
    try {
      if (fs.existsSync(settingsPath)) {
        const data = await fs.promises.readFile(settingsPath, 'utf-8')
        return JSON.parse(data)
      }
      return {}
    } catch (error) {
      console.error('Failed to get settings:', error)
      return {}
    }
  }

  private handleBeforeQuit(event: Electron.Event): void {
    if (this.gameProcess && this.gameProcess.pid) {
      console.log('Electron app is quitting, attempting to kill running executable.')
      event.preventDefault()
      treeKill(this.gameProcess.pid, 'SIGKILL', () => {
        this.gameProcess = null
        app.quit()
      })
    }
  }

  private async deleteExecutable(
    _event: Electron.IpcMainInvokeEvent,
    executable: Executable
  ): Promise<{ success: boolean; error?: string }> {
    const executablesPath = path.join(app.getPath('userData'), 'executables')
    const executableDir = path.join(executablesPath, executable.id)
    try {
      if (fs.existsSync(executableDir)) {
        await fs.promises.rm(executableDir, { recursive: true, force: true })
      }
      return { success: true }
    } catch (error: any) {
      console.error('Failed to delete executable:', error)
      return { success: false, error: error.message }
    }
  }

  private async saveExecutable(
    _event: Electron.IpcMainInvokeEvent,
    executable: Executable
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    const executablesPath = path.join(app.getPath('userData'), 'executables')
    const executableDir = path.join(executablesPath, executable.id)
    const resourcesDir = path.join(executableDir, 'resources')
    const dataFilePath = path.join(executableDir, 'data.json')

    try {
      await fs.promises.mkdir(resourcesDir, { recursive: true })
      const newExecutableData: Executable = { ...executable }

      const processAsset = async (
        assetPath: string | undefined,
        assetName: string
      ): Promise<string | undefined> => {
        if (!assetPath) return undefined

        const isUrl = assetPath.startsWith('http://') || assetPath.startsWith('https://')
        let extension: string

        if (isUrl) {
          try {
            const response = await fetch(assetPath)
            if (!response.ok) throw new Error(`Failed to download`)
            const urlPath = new URL(assetPath).pathname
            extension = path.extname(urlPath)
            if (!extension) {
              const contentType = response.headers.get('content-type')
              if (contentType?.includes('jpeg')) extension = '.jpg'
              else if (contentType?.includes('png')) extension = '.png'
              else if (contentType?.includes('webp')) extension = '.webp'
              else if (contentType?.includes('gif')) extension = '.gif'
              else extension = ''
            }
            const newFileName = `${assetName}${extension}`
            const newPath = path.join(resourcesDir, newFileName)
            const buffer = await response.arrayBuffer()
            await fs.promises.writeFile(newPath, Buffer.from(buffer))
            return path.relative(executableDir, newPath)
          } catch (downloadError: any) {
            return undefined
          }
        } else if (fs.existsSync(assetPath)) {
          extension = path.extname(assetPath)
          const newFileName = `${assetName}${extension}`
          const newPath = path.join(resourcesDir, newFileName)
          await fs.promises.copyFile(assetPath, newPath)
          return path.relative(executableDir, newPath)
        }
        return undefined
      }

      newExecutableData.iconPath = await processAsset(executable.iconPath, 'icon')
      newExecutableData.bannerPath = await processAsset(executable.bannerPath, 'banner')
      newExecutableData.logoPath = await processAsset(executable.logoPath, 'logo')
      newExecutableData.gridPath = await processAsset(executable.gridPath, 'grid')

      const metadata = JSON.stringify(newExecutableData, null, 2)
      await fs.promises.writeFile(dataFilePath, metadata)

      return { success: true, path: executableDir }
    } catch (error: any) {
      try {
        await fs.promises.rm(executableDir, { recursive: true, force: true })
      } catch (cleanupError) {}
      return { success: false, error: error.message }
    }
  }

  private async getAllExecutables(): Promise<Executable[]> {
    const executablesPath = path.join(app.getPath('userData'), 'executables')
    try {
      if (!fs.existsSync(executablesPath)) return []

      const executableDirs = await fs.promises.readdir(executablesPath, { withFileTypes: true })
      const executables: Executable[] = []

      for (const dirent of executableDirs) {
        if (dirent.isDirectory()) {
          const executableDir = path.join(executablesPath, dirent.name)
          const dataFilePath = path.join(executableDir, 'data.json')

          if (fs.existsSync(dataFilePath)) {
            try {
              const data = await fs.promises.readFile(dataFilePath, 'utf-8')
              const executableData: Executable = JSON.parse(data)
              const resolveAssetPath = (relativePath: string | undefined) => {
                return relativePath ? path.join(executableDir, relativePath) : undefined
              }
              executableData.iconPath = resolveAssetPath(executableData.iconPath)
              executableData.bannerPath = resolveAssetPath(executableData.bannerPath)
              executableData.logoPath = resolveAssetPath(executableData.logoPath)
              executableData.gridPath = resolveAssetPath(executableData.gridPath)
              executables.push(executableData)
            } catch (readError) {}
          }
        }
      }
      return executables
    } catch (error) {
      return []
    }
  }

  private async openFileDialog(): Promise<string | null> {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] })
    if (canceled || filePaths.length === 0) return null
    return filePaths[0]
  }
}

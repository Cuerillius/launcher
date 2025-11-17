import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import fs from 'fs'
import { ChildProcess, spawn } from 'child_process'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import treeKill from 'tree-kill'
import icon from '../../resources/icon.png?asset'
import { Executable } from '../shared/types'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  let gameProcess: ChildProcess | null = null

  ipcMain.on('launch-executable', (event, executablePath: string) => {
    if (gameProcess) {
      console.log('An executable is already running.')
      event.sender.send('executable-already-running')
      return
    }

    try {
      const gameExecutable = path.basename(executablePath)
      const gameDirectory = path.dirname(executablePath)

      gameProcess = spawn(gameExecutable, [], {
        cwd: gameDirectory,
        detached: true,
        stdio: 'ignore'
      })

      console.log(`Executable process started with PID: ${gameProcess.pid}`)

      // *** FIX 1: Send confirmation back to the renderer ***
      // This tells the React component to update its UI to the "running" state.
      event.sender.send('executable-started', gameProcess.pid)
      // *** FIX 2: Add a robust 'error' handler for the spawn process itself ***
      gameProcess.on('error', (err) => {
        console.error('Failed to start executable process:', err)
        event.sender.send('executable-start-error', err.message)
        gameProcess = null // Reset the process state
      })

      // Use 'exit' which is more comprehensive than 'close'.
      // This handles the case where the user closes the executable  manually.
      gameProcess.on('exit', (code) => {
        console.log(`Executable process exited with code: ${code}`)
        // *** FIX 3: Inform the renderer that the executable has stopped ***
        // This allows the UI to reset even if the executable is closed outside the launcher.
        event.sender.send('executable-stopped')
        gameProcess = null
      })
    } catch (error: any) {
      // *** FIX 4: Send launch errors back to the renderer ***
      console.error('Error trying to spawn executable:', error)
      event.sender.send('executable-start-error', error.message)
      gameProcess = null
    }
  })

  ipcMain.on('stop-executable', (event) => {
    if (!gameProcess || !gameProcess.pid) {
      console.log('No executable process to stop.')
      // Optional: Let the renderer know there was nothing to stop.
      event.sender.send('no-executable-running')
      return
    }

    console.log(`Attempting to kill executable process tree with PID: ${gameProcess.pid}`)

    treeKill(gameProcess.pid, 'SIGKILL', (err) => {
      if (err) {
        console.error('Error killing game process tree:', err)
        event.sender.send('game-stop-error', err.message)
      } else {
        console.log('Executable process tree killed successfully.')
        // The 'exit' event on the gameProcess will fire automatically after the kill,
        // which will then send the 'executable-stopped' message.
        // So you don't strictly need to send it from here, but setting the process to null is safe.
        gameProcess = null
      }
    })
  })

  app.on('before-quit', (event) => {
    if (gameProcess && gameProcess.pid) {
      console.log('Electron app is quitting, attempting to kill running executable.')
      event.preventDefault()
      treeKill(gameProcess.pid, 'SIGKILL', (err) => {
        if (err) {
          console.error('Error killing executable process during app quit:', err)
        }
        gameProcess = null
        app.quit()
      })
    }
  })

  ipcMain.handle('save-executable', async (_event, executable: Executable) => {
    const executablesPath = path.join(app.getPath('userData'), 'executables')
    const executableDir = path.join(executablesPath, executable.id)
    const resourcesDir = path.join(executableDir, 'resources')
    const dataFilePath = path.join(executableDir, 'data.json')

    try {
      await fs.promises.mkdir(resourcesDir, { recursive: true })
      const newExecutableData: Executable = { ...executable }

      if (executable.iconPath && fs.existsSync(executable.iconPath)) {
        const iconExtension = path.extname(executable.iconPath)
        const newIconFileName = `icon${iconExtension}`
        const newIconPath = path.join(resourcesDir, newIconFileName)
        await fs.promises.copyFile(executable.iconPath, newIconPath)
        newExecutableData.iconPath = path.relative(executableDir, newIconPath)
      }

      if (executable.bannerPath && fs.existsSync(executable.bannerPath)) {
        const bannerExtension = path.extname(executable.bannerPath)
        const newBannerFileName = `banner${bannerExtension}`
        const newBannerPath = path.join(resourcesDir, newBannerFileName)
        await fs.promises.copyFile(executable.bannerPath, newBannerPath)
        newExecutableData.bannerPath = path.relative(executableDir, newBannerPath)
      }

      if (executable.logoPath && fs.existsSync(executable.logoPath)) {
        const logoExtension = path.extname(executable.logoPath)
        const newLogoFileName = `logo${logoExtension}`
        const newLogoPath = path.join(resourcesDir, newLogoFileName)
        await fs.promises.copyFile(executable.logoPath, newLogoPath)
        newExecutableData.logoPath = path.relative(executableDir, newLogoPath)
      }

      if (executable.gridPath && fs.existsSync(executable.gridPath)) {
        const gridExtension = path.extname(executable.gridPath)
        const newGridFileName = `grid${gridExtension}`
        const newGridPath = path.join(resourcesDir, newGridFileName)
        await fs.promises.copyFile(executable.gridPath, newGridPath)
        newExecutableData.gridPath = path.relative(executableDir, newGridPath)
      }

      const metadata = JSON.stringify(newExecutableData, null, 2)
      await fs.promises.writeFile(dataFilePath, metadata)

      return { success: true, path: executableDir }
    } catch (error: any) {
      console.error('Failed to save executable:', error)
      try {
        await fs.promises.rm(executableDir, { recursive: true, force: true })
      } catch (cleanupError) {
        console.error('Failed to cleanup directory on error:', cleanupError)
      }
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('get-all-executables', async () => {
    const executablesPath = path.join(app.getPath('userData'), 'executables')
    try {
      if (!fs.existsSync(executablesPath)) {
        return []
      }

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

              if (executableData.iconPath) {
                executableData.iconPath = path.join(executableDir, executableData.iconPath)
              }
              if (executableData.bannerPath) {
                executableData.bannerPath = path.join(executableDir, executableData.bannerPath)
              }
              if (executableData.logoPath) {
                executableData.logoPath = path.join(executableDir, executableData.logoPath)
              }
              if (executableData.gridPath) {
                executableData.gridPath = path.join(executableDir, executableData.gridPath)
              }
              executables.push(executableData)
            } catch (readError) {
              console.error(
                `Failed to read or parse executable data for ${dirent.name}:`,
                readError
              )
            }
          }
        }
      }
      return executables
    } catch (error) {
      console.error('Failed to get all executables:', error)
      return []
    }
  })

  ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'] // Or 'openDirectory'
      // You can add filters here, for example:
      // filters: [
      //   { name: 'Executables', extensions: ['exe', 'app', 'sh'] },
      //   { name: 'All Files', extensions: ['*'] }
      // ]
    })

    if (canceled || filePaths.length === 0) {
      return null
    } else {
      return filePaths[0]
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

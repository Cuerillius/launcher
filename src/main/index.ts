import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
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

  ipcMain.handle('launch-executable', async (_event, path: string) => {
    try {
      const error = await shell.openPath(path)
      if (error) {
        console.error(`Failed to launch executable: ${error}`)
        return { success: false, error }
      }
      return { success: true }
    } catch (e: any) {
      console.error(`Error launching executable: ${e.message}`)
      return { success: false, error: e.message }
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
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

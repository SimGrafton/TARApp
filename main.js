'use strict'

const { ipcMain } = require('electron');
const electron = require('electron')
const app = electron.app
const globalShortcut = electron.globalShortcut
const os = require('os')
const path = require('path')
const config = require(path.join(__dirname, 'package.json'))
const BrowserWindow = electron.BrowserWindow

//app.setName(config.productName)
var mainWindow = null


app.on('ready', function () {
  mainWindow = new BrowserWindow({
    frame: false,
    minWidth: 800,
    autoHideMenuBar: true,
    backgroundColor: 'lightgray',
    title: config.productName,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      defaultEncoding: 'UTF-8',
      contextIsolation: false, // protect against prototype pollution
      worldSafeExecuteJavaScript: true,
      /* See https://stackoverflow.com/questions/63427191/security-warning-in-the-console-of-browserwindow-electron-9-2-0 */
      enableRemoteModule: false,
      preload: path.join(app.getAppPath(), 'preload.js')
    }
  })

  // Open dev tools
  mainWindow.webContents.openDevTools()

  // Load html
  mainWindow.loadURL(`file://${__dirname}/app/index.html`)

  mainWindow.once('ready-to-show', () => {
    //mainWindow.setMenu(null)
    mainWindow.show()
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  // Minimise button
  ipcMain.on('min', () => {
    mainWindow.minimize(); 
  })

  // Close button
  ipcMain.on('close', () => {
    mainWindow.close(); 
  })

})

app.on('window-all-closed', () => { app.quit() })



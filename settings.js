const {BrowserWindow} = require('electron');
const path = require('path')
const url = require('url')
const os = require('os')


class SettingsWindow extends BrowserWindow {
  constructor() {
        // Create the browser window.
    super({
      width: 300,
      height: 450,
      show: false,
      frame: false,
      fullscreenable: false,
      resizable: false,
      transparent: true,
      webPreferences: {
        backgroundThrottling: false
      }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
      mainWindow = null
    })
  }
}
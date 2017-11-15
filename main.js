
const { app } = require('electron')
const ssdp = require('./lib/ssdp');
const system = require('./util/system');
const TrayMenu = require('./tray');

let tray = null;

const devices = [{
  id: '1234',
  ip: '127.0.0.1',
  name: `${system.getUserFullName()}'s ${system.getComputerName()}`
}];

// app.dock.hide();
ssdp.start(devices[0].name);
app.on('ready', () => {
  tray = new TrayMenu(devices);

  tray.onDeviceSelected((item) => {
    console.log('selected', item)
  });

  tray.onOpenSettings(() => {
    console.log('open settings');
  });

  tray.onQuit(() => {
    app.quit();
  });
});

app.on('quit', () => {
  ssdp.stop();
});
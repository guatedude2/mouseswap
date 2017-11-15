const debug = require('debug')('mouseswap');
const { app } = require('electron');
const ssdp = require('./lib/ssdp');
const wscomm = require('./lib/wscomm');
// const bluetooth = require('./lib/bluetooth');
const system = require('./util/system');
const TrayMenu = require('./tray');
const packageJson = require('./package.json');

let tray = null;

debug(`starting mouseswap VERSION: ${packageJson.version}`);

const settings = {
  uuid: '0fade7e0-2211-4ba4-a4e8-1ca6a961c4eb',
  version: packageJson.version,
  name: `${system.getUserFullName()}'s ${system.getComputerName()}`,
  networkInterface: 'en0',
  port: 18000
};

// app.dock.hide();
app.on('ready', () => {
  tray = new TrayMenu();

  tray.onDeviceSelected((item) => {
    console.log('selected', item)
  });

  tray.onOpenPreferences(() => {
    console.log('open preferences');
  });

  tray.onQuit(() => {
    app.quit();
  });

  ssdp.onDiscover((device) => {
    tray.addDevice(device);
  });

  ssdp.start(settings);
  wscomm.listen(settings.port);
});

app.on('quit', () => {
  ssdp.stop();
});
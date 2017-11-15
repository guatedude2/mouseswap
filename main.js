const debug = require('debug')('mouseswap');
const { app } = require('electron');
const discovery = require('./lib/discovery');
const wscomm = require('./lib/wscomm');
// const bluetooth = require('./lib/bluetooth');
const system = require('./util/system');
const TrayMenu = require('./tray');
const packageJson = require('./package.json');

let tray = null;

debug(`starting mouseswap VERSION:${packageJson.version}`);

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

  tray.addDevice({
    uuid: settings.uuid,
    name: settings.name,
    ip: '127.0.0.1'
  });

  tray.onDeviceSelected((item) => {
    wscomm.broadcastSwap(item.uuid);
  });

  tray.onOpenPreferences(() => {
    console.log('open preferences');
  });

  tray.onQuit(() => {
    app.quit();
  });

  discovery.onDiscover((device) => {
    wscomm.connectDevice(device);
  });

  wscomm.onDeviceConnected((device) => {
    tray.addDevice(device);
  });

  wscomm.onDeviceDisconnected((device) => {
    tray.removeDevice(device);
  });

  discovery.start(settings);
  wscomm.listen(settings);
});

app.on('quit', () => {
  discovery.stop();
});


process.on('SIGINT',() => {
  if (!this.bus) {
    process.exit(0);
  }
  debug('recieved SIGINT stopping bus');
  discovery.stop(error => {
    process.exit(error ? 1 : 0);
  });
});

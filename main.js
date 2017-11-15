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
  version: packageJson.version,
  networkInterface: 'en0',
  port: 18000,
  device: {
    uuid: 'mac-pro',//'0fade7e0-2211-4ba4-a4e8-1ca6a961c4eb',
    name: `${system.getUserFullName()}'s ${system.getComputerName()}`,
    ip: '127.0.0.1'
  }
};

const {port, device } = settings;

// app.dock.hide();
app.on('ready', () => {
  tray = new TrayMenu();

  tray.addDevice(settings.device);

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
    wscomm.connectToDevice(device);
  });

  wscomm.onDeviceConnected((device) => {
    tray.addDevice(device);
  });

  wscomm.onDeviceDisconnected((device) => {
    tray.removeDevice(device);
  });

  discovery.start(settings, device);
  wscomm.listen(port, device);
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

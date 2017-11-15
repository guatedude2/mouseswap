const debug = require('debug')('mouseswap:wscomm');
const WebSocket = require('ws');
const EventEmitter = require('events');

class WSComm {
  constructor() {
    this.events = new EventEmitter();
  }

  listen({ port, uuid }) {
    debug(`staring wscomm on port ${port}`);
    this.uuid = uuid;
    this.wss = new WebSocket.Server({ port });
    // this.devices = [];

    this.wss.on('connection', (ws) => {
      //   ws.isAlive = true;
      //   ws.ip = req.connection.remoteAddress.split(':').pop();
      debug(`client connected ${ws.ip}`);
      //   this.events.emit();
      //   ws.on('pong', () => {
      //     ws.isAlive = true;
      //   });
      //   ws.on('message', (message) => {
      //     debug(`message recieved ${message}`);
      //   });
        ws.on('close', () => {
          this.events.emit();
          debug(`client disconnected ${ws.ip}`);
        });
    });

    // setInterval(() => {
    //   this.wss.clients.forEach((ws) => {
    //     if (ws.isAlive === false) {
    //       return ws.terminate();
    //     }
    //     ws.isAlive = false;
    //     ws.ping('', false, true);
    //   });
    // }, 5000);
  }

  connectDevice(device) {
    if (this.devices.find((dev) => dev.uuid === device.uuid)) {
      return;
    }
    const ws = new WebSocket(device.URLBase);
    ws.on('open', () => {
      debug(`device connected ${device.uuid}`);
      ws.send(JSON.stringify({ action: 'device-available', data: device }));
    });

    this.devices.push({
      device,
      ws
    });
  }

  broadcastSwap(uuid) {
    if (!this.wss) {
      throw new Error('WSComm not started');
    }
    this.devices.forEach(({ ws }) => {
      ws.send(JSON.stringify({ action: 'swap-device', data: uuid }));
    });
  }

  onDeviceConnected(callback) {
    this.events.on('connected', callback);
  }

  onDeviceDisconnected(callback) {
    this.events.on('disconnected', callback);
  }

}

module.exports = new WSComm();
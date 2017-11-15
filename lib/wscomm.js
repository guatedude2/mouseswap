const debug = require('debug')('mouseswap:wscomm');
const WebSocket = require('ws');
const EventEmitter = require('events');

const jsonMessage = (callback) => {
  return (data) => {
    try {
      return callback(JSON.parse(data));
    } catch (err) {
      return callback(null);
    }
  };
};

/*

Device
  Server <-
    on AVAIL register device (if usePass ask user for password)
    on disconnect unregister device
    send SWAP message to client
  Client ->
    send AVIL details of self to other devices (uuid, name, usePass)
    sends events
    on SWAP turn bluetooth on/off

*/

class WSComm {
  constructor() {
    this.events = new EventEmitter();
  }

  listen(port, device) {
    debug(`staring wscomm on port ${port}`);
    this.device = device;
    this.wss = new WebSocket.Server({ port });
    this.clients = [];
    this.devices = [];

    this.wss.on('connection', (ws) => {
      //   ws.isAlive = true;
      //   this.events.emit();
      //   ws.on('pong', () => {
      //     ws.isAlive = true;
      //   });
      ws.on('message', jsonMessage((data) => {
        switch (data.action) {
          case 'AVAIL':
            if (this.devices.find((dev) => dev.uuid === device.uuid)) {
              return ws.terminate();
            }
            ws.uuid = data.data.uuid;
            debug(`registering device ${ws.uuid}`);
            this.devices.push(data.data);
            break;
          default:
            debug(`unknown action ${data.action}`);
        }
      }));
      ws.on('close', () => {
        if (ws.uuid) {
          debug(`client disconnected ${ws.uuid}`);
          this.devices = this.devices.filter((dev) => dev.uuid !== ws.uuid);
        }
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

  connectToDevice(device) {
    if (this.clients.find((client) => client.uuid === device.uuid)) {
      return;
    }
    const ws = new WebSocket(device.URLBase);
    ws.uuid = device.uuid;
    ws.on('open', () => {
      debug('registering with other devices');
      ws.send(JSON.stringify({ action: 'AVAIL', data: this.device }));
    });

    ws.on('close', () => {
      debug('removing client');
      this.clients = this.clients.filter((client) => client.uudi === ws.uuid);
    });

    // ws.on('message', jsonMessage((data) => {
    //   switch (data.action) {
    //     case 'VRFY':
    //       debug(`device connected ${device.uuid}`);
    //       break;
    //     default:
    //       debug(`unknown action ${data.action}`);
    //   }
    // }));

    this.clients.push(ws);
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
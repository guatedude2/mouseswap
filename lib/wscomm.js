const debug = require('debug')('mouseswap:wscomm');
const WebSocket = require('ws');
const bluetooth = require('./bluetooth');

class WSComm {
  listen(port) {
    debug(`staring wscomm on port ${port}`);
    this.wss = new WebSocket.Server({ port });
    this.clients  = [];

    this.wss.on('connection', (ws, req) => {
      ws.isAlive = true;
      ws.ip = req.connection.remoteAddress;
      debug(`client connected ${ws.ip}`);
      ws.on('pong', () => {
        ws.isAlive = true;
      });
      ws.on('message', (message) => {
        debug(`message recieved ${message}`);
      });
    });

    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          debug(`client disconnected ${ws.ip}`);
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping('', false, true);
      });
    }, 5000);
  }

  addDevice(device) {
    const ws = new WebSocket(device.URLBase);

    ws.on('open', () => {
      ws.send(JSON.stringify({action: 'device-available', data: device.uuid}));
    });

    // ws.on('message', (data) => {
    //   console.log(data);
    // });

    this.clients.push({
      device,
      ws
    });
  }

  broadcastSwap(uuid) {
    if (!this.wss) {
      throw new Error('WSComm not started');
    }
    this.clients.forEach(({ws}) => {
      ws.send(JSON.stringify({action: 'swap-device', data: uuid}));
    });
  }

}

module.exports = new WSComm();
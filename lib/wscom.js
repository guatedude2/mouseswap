const WebSocket = require('ws');
const bluetooth = require('./bluetooth');

class WSComm {
  listen(port) {
    this.ws = new WebSocket.Server({ port });

    this.ws.on('connection', function connection(ws) {
      console.log('connected');
      ws.on('message', function incoming(message) {
        console.log('received: %s', message);
      });

    });
  }

  enableBluetooth() {
    if (!this.ws) {
      throw new Error('Not connected to device');
    }
    this.ws.send('focus-device');
  }

  disableBluetooth() {
    if (!this.ws) {
      throw new Error('Not connected to device');
    }
    this.ws.send('blur-device');
  }
}

module.exports = new WSComm();
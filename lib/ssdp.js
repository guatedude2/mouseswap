const { Server, Client } = require('node-ssdp');

class SSDP {
  start() {
    this.devices = [];
    this.server = new Server()
    this.server.addUSN('upnp:rootdevice');
    this.server.addUSN('urn:schemas-upnp-org:device:MediaServer:1');
    this.server.addUSN('urn:schemas-upnp-org:service:ContentDirectory:1');
    this.server.addUSN('urn:schemas-upnp-org:service:ConnectionManager:1');

    this.server.on('advertise-alive', function (headers) {
      // Expire old devices from your cache.
      // Register advertising device somewhere (as designated in http headers heads)
      console.log('ALIVE', headers)
    });

    this.server.on('advertise-bye', function (headers) {
      // Remove specified device from cache.
      console.log('BYE', headers)
    });

    // start the server
    this.server.start();


    this.client = new Client({
      //    unicastHost: '192.168.11.63'
    })

    this.client.on('notify', function () {
      //console.log('Got a notification.')
      console.log('NOTIFY', arguments)
    })

    this.client.on('response', function inResponse(headers, code, rinfo) {
      // this.devices
      console.log('RESP', headers, code, rinfo)
    })
  }

  stop() {
    this.server.stop();
    this.client.stop()
  }

  scan() {
    this.devices = [];
    this.client.search('ssdp:all');
  }
}

module.exports = new SSDP();
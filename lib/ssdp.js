const ssdp = require('@achingbrain/ssdp');
const EventEmitter = require('events');
const iface = require('../util/iface');


const URN = 'urn:mouseshare:SwappableDevices:1';

class SSDP {
  constructor() {
    this.events = new EventEmitter();
    process.on('SIGINT',() => {
      if (!this.bus) {
        process.exit(0);
      }
      this.bus.stop(error => {
        process.exit(error ? 1 : 0);
      });
    });
  }

  start(settings) {
    const ifaces = iface.getNetworkInterfaces();
    this.bus = ssdp({
      bind: {
        address: ifaces[settings.networkInterface]
      }
    });

    this.bus.discover(URN);
    this.bus.on(`discover:${URN}`, service => {
      this.events.emit('discover', service.details);
    });

    this.bus.advertise({
      usn: URN,
      details: {
        URLBase: `ws://${ifaces[settings.networkInterface]}:${settings.port}`,
        ver: settings.version,
        ip: 'ip',
        uuid: settings.uuid,
        name: settings.name,
        device: null
      }
    }).then(advert => {
      // stop advertising a service
      // advert.stop()
    });
  }

  stop() {
    this.bus.stop();
  }

  onDiscover(callback) {
    this.events.on('discover', callback);
  }
}
module.exports = new SSDP();
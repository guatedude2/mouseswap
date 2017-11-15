const debug = require('debug')('mouseswap:ssdp');
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
      debug('recieved SIGINT stopping bus');
      this.bus.stop(error => {
        process.exit(error ? 1 : 0);
      });
    });
  }

  start(settings) {
    const ifaces = iface.getNetworkInterfaces();
    const ipAddress = ifaces[settings.networkInterface];
    debug('starting ssdp');
    debug(`IFACE:${settings.networkInterface} IP:${ipAddress}`);
    this.bus = ssdp({
      bind: {
        address: ipAddress
      }
    });

    this.bus.discover(URN);
    this.bus.on(`discover:${URN}`, service => {
      debug(`discovered device IP:${service.details.ip} UUID:${service.details.uuid} NAME:${service.details.name} VER:${service.details.ver}`);
      this.events.emit('discover', service.details);
    });

    debug(`broadcasting self UUID:${settings.uuid} NAME:${settings.name} VER:${settings.version}`);
    this.bus.advertise({
      usn: URN,
      details: {
        URLBase: `ws://${ipAddress}:${settings.port}`,
        ip: ipAddress,
        ver: settings.version,
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
    debug('stopping bus');
    this.bus.stop();
  }

  onDiscover(callback) {
    this.events.on('discover', callback);
  }
}
module.exports = new SSDP();
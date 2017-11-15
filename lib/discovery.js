const debug = require('debug')('mouseswap:ssdp');
const ssdp = require('@achingbrain/ssdp');
const EventEmitter = require('events');
const semver = require('semver');
const iface = require('../util/iface');


const URN = 'urn:mouseshare:SwappableDevices:1';

class SSDP {
  constructor() {
    this.events = new EventEmitter();
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
      if (service.details.uuid === settings.uuid) {
        return;
      } else if (!semver.satisfies(service.details.ver, `^${settings.version}`)) {
        debug(`discovered incompatible device IP:${service.details.ip} UUID:${service.details.uuid} VER:${service.details.ver}`);
        return;
      }
      debug(`discovered device IP:${service.details.ip} UUID:${service.details.uuid} VER:${service.details.ver}`);
      this.events.emit('discover', service.details);
    });

    debug(`broadcasting self UUID:${settings.uuid} VER:${settings.version}`);
    this.bus.advertise({
      usn: URN,
      details: {
        URLBase: `ws://${ipAddress}:${settings.port}`,
        ip: ipAddress,
        ver: settings.version,
        uuid: settings.uuid,
        device: null
      }
    });
  }

  stop(callback) {
    debug('stopping bus');
    return this.bus.stop(callback);
  }

  onDiscover(callback) {
    this.events.on('discover', callback);
  }
}
module.exports = new SSDP();
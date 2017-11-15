const ssdp = require('@achingbrain/ssdp');
const bus = ssdp();

const URN = 'urn:mouseshare:SwappableDevices:1';

class SSDP {
  start() {
    bus.discover(URN)
    bus.on(`discover:${URN}`, service => {
      // receive a notification about a service

      bus.on('update:' + service.UDN, service => {
        // receive a notification when that service is updated - nb. this will only happen
        // after the service max-age is reached and if the service's device description
        // document has changed
      });
    });
    bus.advertise({
      usn: URN,
      details: {
        URLBase: 'https://192.168.0.1:8001'
      }
    }).then(advert => {
      // stop advertising a service
      // advert.stop()
    });
  }

  stop() {

  }
}

module.exports = new SSDP();
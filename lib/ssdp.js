const ssdp = require('@achingbrain/ssdp');
const packageJson = require('../package.json');
const os = require('os');
const bus = ssdp();

const URN = 'urn:mouseshare:SwappableDevices:1';

class SSDP {
  constructor(name) {
    this.name = name;
    process.on('SIGINT',() => {
      bus.stop(error => {
        process.exit(error ? 1 : 0);
      });
    });
  }
  start() {
    bus.discover(URN);
    bus.on(`discover:${URN}`, service => {
      console.log('DISC', service)
      // receive a notification about a service

      bus.on('update:' + service.UDN, service => {
        // receive a notification when that service is updated - nb. this will only happen
        // after the service max-age is reached and if the service's device description
        // document has changed
      console.log('UPDATE', service)
      });
    });

    // var ifaces = os.networkInterfaces();

    // Object.keys(ifaces).forEach(function (ifname) {
    //   var alias = 0;

    //   ifaces[ifname].forEach(function (iface) {
    //     if ('IPv4' !== iface.family || iface.internal !== false) {
    //       // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
    //       return;
    //     }

    //     if (alias >= 1) {
    //       // this single interface has multiple ipv4 addresses
    //       console.log(ifname + ':' + alias, iface.address);
    //     } else {
    //       // this interface has only one ipv4 adress
    //       console.log(ifname, iface.address);
    //     }
    //     ++alias;
    //   });
    // });

    bus.advertise({
      usn: URN,
      details: {
        ver: packageJson.version,
        ip: 'ip',
        name: this.name,
        device: null
      }
    }).then(advert => {
      // stop advertising a service
      // advert.stop()
    });
  }

  stop() {
    bus.stop();
  }
}
module.exports = new SSDP();
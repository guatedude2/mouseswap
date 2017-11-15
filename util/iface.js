const os = require('os');

module.exports = {
  getNetworkInterfaces() {
    const netiface = os.networkInterfaces();
    const ifaces = {};
    Object.keys(netiface).forEach(function (ifname) {
      var alias = 0;

      netiface[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          return;
        }

        if (alias >= 1) {
          ifaces[`${ifname}:${alias}`] = iface.address;
        } else {
          ifaces[ifname] = iface.address;
        }
        ++alias;
      });
    });
    return ifaces;
  }
};
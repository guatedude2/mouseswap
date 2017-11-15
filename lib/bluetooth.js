const debug = require('debug')('mouseswap:bluetooth');
const osxBluetooth = require('osx-bluetooth');

class Bluetooth {
  on() {
    osxBluetooth.isOn().then(state => {
      if (!state) {
        return osxBluetooth.on().then(() => {
          debug('bluetooth on');
        });
      }
      debug('bluetooth already on');
    });
  }
  off() {
    osxBluetooth.isOn().then(state => {
      if (state) {
        return osxBluetooth.off().then(() => {
          debug('bluetooth off');
        });
      }
      debug('bluetooth already off');
    });
  }
}

module.exports = new Bluetooth();
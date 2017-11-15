
const path = require('path');
const { Tray, Menu } = require('electron');
const EventEmitter = require('events');

const NORMAL_ICON = path.join(__dirname, '/assets/images/icon.png');
const PRESSED_ICON = path.join(__dirname, '/assets/images/icon_pressed.png');

module.exports = class TrayMenu extends Tray {
  constructor(devices = []) {
    super(NORMAL_ICON);
    this.events = new EventEmitter();
    this.setPressedImage(PRESSED_ICON);
    this.setToolTip('Mouseswap');
    this.setContextMenu(Menu.buildFromTemplate([
      ...devices.map((device) => ({
        device,
        type: 'radio',
        label: device.name,
        click: (item) => this.events.emit('selected', item.device),
        selected: true
      })),
      { type: 'separator' },
      { label: 'Settings', click: () => this.events.emit('settings') },
      { type: 'separator' },
      { label: 'Quit', click: () => this.events.emit('quit') }
    ]));
  }

  onDeviceSelected(callback) {
    this.events.on('selected', callback);
  }

  onOpenSettings(callback) {
    this.events.on('settings', callback);
  }

  onQuit(callback) {
    this.events.on('quit', callback);
  }

  updateDevices() {

  }
};
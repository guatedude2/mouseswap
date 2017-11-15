const debug = require('debug')('mouseswap:tray');
const path = require('path');
const { Tray, Menu } = require('electron');
const EventEmitter = require('events');

const NORMAL_ICON = path.join(__dirname, '/assets/images/icon.png');
const PRESSED_ICON = path.join(__dirname, '/assets/images/icon_pressed.png');

module.exports = class TrayMenu extends Tray {
  constructor() {
    super(NORMAL_ICON);
    this.devices = [];
    this.events = new EventEmitter();
    debug('loading tray');
    this.setPressedImage(PRESSED_ICON);
    this.setToolTip('Mouseswap');
    this.setContextMenu(Menu.buildFromTemplate([
      { type: 'separator' },
      { label: 'Settings', click: () => this.events.emit('settings') },
      { type: 'separator' },
      { label: 'Quit', click: () => this.events.emit('quit') }
    ]));
  }

  onDeviceSelected(callback) {
    this.events.on('selected', callback);
  }

  onOpenPreferences(callback) {
    this.events.on('preferences', callback);
  }

  onQuit(callback) {
    this.events.on('quit', callback);
  }

  updateDevices() {
    this.setContextMenu(Menu.buildFromTemplate([
      ...this.devices.map((device) => ({
        device,
        type: 'radio',
        label: device.name,
        click: (item) => this.events.emit('selected', item.device),
        selected: true
      })),
      { type: 'separator' },
      { label: 'Preferences...', click: () => this.events.emit('preferences') },
      { type: 'separator' },
      { label: 'Quit', click: () => this.events.emit('quit') }
    ]));
  }

  addDevice(device) {
    if (this.devices.find((dev) => dev.uuid === device.uuid)) {
      return;
    }
    this.devices.push(device);
    this.updateDevices();
    debug('device added to tray');
  }

  removeDevice(uuid) {
    if (!this.devices.find((dev) => dev.uuid == uuid)) {
      return;
    }
    this.devices = this.devices.filter((dev) => dev.uuid !== uuid);
    this.updateDevices();
    debug('device remove from tray');
  }
};
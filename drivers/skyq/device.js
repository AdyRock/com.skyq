/*jslint node: true */
'use strict';

const Homey = require('homey');
const SkyRemote = require('../../lib/SkyRemote');
const SkyQ = require('../../lib/SkyQ');

class MyDevice extends Homey.Device
{
	/**
	 * onInit is called when the device is initialized.
	 */
	async onInit()
	{
		this.log('MyDevice has been initialized');

		// register a capability listener
		this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
		this.registerCapabilityListener('channel_down', this.onCapabilityChannelDown.bind(this));
		this.registerCapabilityListener('channel_up', this.onCapabilityChannelUp.bind(this));
		this.registerCapabilityListener('speaker_playing', this.onCapabilitySpeakerPlaying.bind(this));

		this.IP = this.getSetting('ip');
		this.remoteControl = new SkyRemote(this.IP);
		this.box = new SkyQ({ ip: this.IP });
		this.onOffTimer = null;
		this.MAC = this.getSetting('MAC');
		if (!this.MAC)
		{
			this.MAC = await this.box._getSystemInformation({key:'MACAddress'});
			this.setSettings({'MAC': this.MAC});
		}

		this.pollOnOff = this.pollOnOff.bind( this );
		this.pollOnOff();
	}

	async pollOnOff()
	{
		this.box.getPowerState().then(isOn => {
			this.setCapabilityValue('onoff', isOn);
		}).catch(err => {
			console.error("Unable to determine power state");
			console.error("Perhaps looking at this error will help you figure out why", err);
		});

		clearTimeout(this.onOffTimer);
		this.onOffTimer = setTimeout(this.pollOnOff, 3000);
	}

	/**
	 * onAdded is called when the user adds the device, called just after pairing.
	 */
	async onAdded()
	{
		this.log('MyDevice has been added');
	}

	/**
	 * onSettings is called when the user updates the device's settings.
	 * @param {object} event the onSettings event data
	 * @param {object} event.oldSettings The old settings object
	 * @param {object} event.newSettings The new settings object
	 * @param {string[]} event.changedKeys An array of keys changed since the previous version
	 * @returns {Promise<string|void>} return a custom message that will be displayed
	 */
	async onSettings({ oldSettings, newSettings, changedKeys })
	{
		if (changedKeys.indexOf("ip") >= 0)
		{
			this.ip = newSettings.ip;
			this.remoteControl = new SkyRemote(this.IP);
			this.box = new SkyQ({ ip: this.IP });
		}
	}

	/**
	 * onRenamed is called when the user updates the device's name.
	 * This method can be used this to synchronise the name to the device.
	 * @param {string} name The new name
	 */
	async onRenamed(name)
	{
		this.log('MyDevice was renamed');
	}

	/**
	 * onDeleted is called when the user deleted the device.
	 */
	async onDeleted()
	{
		this.log('MyDevice has been deleted');
		clearTimeout(this.onOffTimer);
	}

	async onCapabilityOnOff(value, opts)
	{
		if (await this.box.getPowerState() !== value)
		{
			this.remoteControl.press('power');
		}
	}

	async onCapabilityChannelDown(value, opts)
	{
		this.remoteControl.press('channeldown');
	}

	async onCapabilityChannelUp(value, opts)
	{
		this.remoteControl.press('channelup');
	}

	async onCapabilitySpeakerPlaying(value, opts)
	{
		if (value)
		{
			this.remoteControl.press('play');
		}
		else
		{
			this.remoteControl.press('pause');
		}
	}

	async sendCommands(commands)
	{
		this.remoteControl.press(commands);
	}
}

module.exports = MyDevice;
/*jslint node: true */
'use strict';

const Homey = require('homey');
var upnp = require('node-upnp-utils');

// Set an event listener for 'added' event
upnp.on('added', (device) =>
{
    // This callback function will be called whenever an device is found.
    // if (device.headers.LOCATION.search('192.168.1.48') >= 0)
    // {
    //     console.log(device);
    //     console.log('------------------------------------');
    // }
});

upnp.on('error', (err) =>
{
    console.log(err);
});

class MyDriver extends Homey.Driver
{
    /**
     * onInit is called when the driver is initialized.
     */
    async onInit()
    {
        this.log('MyDriver has been initialized');
    }

    /**
     * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
     * This should return an array with the data of devices that are available for pairing.
     */
    async onPairListDevices()
    {
        // Start the discovery process
        upnp.startDiscovery();

        function findFunc(element)
        {
            return element.settings.ip === this;
        }

        return new Promise((resolve, reject) =>
        {

            // Stop the discovery process in 15 seconds
            setTimeout(() =>
            {
                upnp.stopDiscovery(() =>
                {
                    console.log('Stopped the discovery process.');
                    var deviceList = upnp.getActiveDeviceList();
                    deviceList = deviceList.filter(entry => entry.headers.SERVER && (entry.headers.SERVER.search('Sky') >= 0));
                    console.log(deviceList);

                    var devices = [];

                    for (var idx = 0; idx < deviceList.length; idx++)
                    {
                        // Make sure we don't already have this IP
                        var i = devices.findIndex(findFunc, deviceList[idx].address);
                        if (i < 0)
                        {
                            var server = deviceList[idx].headers.SERVER.split(',');
                            var model = server[1];
                            devices.push(
                            {
                                "name": 'Sky ' + model + ": " + deviceList[idx].address,
                                data:
                                {
                                    "id": deviceList[idx].headers['01-NLS']
                                },
                                settings:
                                {
                                    "ip": deviceList[idx].address
                                }
                            });
                        }
                    }

                    //console.log( devices );
                    return resolve(devices);
                });
            }, 5000);
        });
    }
}

module.exports = MyDriver;
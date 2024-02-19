'use strict';
if (process.env.DEBUG === '1')
{
    require('inspector').open(9222, '0.0.0.0', true)
}

const Homey = require('homey');

class MyApp extends Homey.App
{
    /**
     * onInit is called when the app is initialized.
     */
    async onInit()
    {
        this.homey.flow.getActionCard('send_coomands')
            .registerRunListener(async (args, state) =>
            {
				const commands = [args.c1];
				if (args.c2) commands.push(args.c2);
				if (args.c3) commands.push(args.c3);
				if (args.c4) commands.push(args.c4);
				if (args.c5) commands.push(args.c5);
				if (args.c6) commands.push(args.c6);
				if (args.c7) commands.push(args.c7);
				if (args.c8) commands.push(args.c8);
				if (args.c9) commands.push(args.c9);
				if (args.c10) commands.push(args.c10);
                return args.device.sendCommands(commands);
            })

        this.log('MyApp has been initialized');
    }
}

module.exports = MyApp;
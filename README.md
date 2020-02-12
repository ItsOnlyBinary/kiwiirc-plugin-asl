# Custom Startup for [Kiwi IRC] (https://kiwiirc.com)

This plugin creates a customised startup screen for age/sex/location based off Welcome.vue  
It then display's this data in a customised userbox based off UserBox.vue

#### Dependencies
* node (https://nodejs.org/)
* yarn (https://yarnpkg.com/)

#### Building and installing

1. Build the plugin

   ```console
   $ yarn
   $ yarn build
   ```

   The plugin will then be created at `dist/plugin-custom-startup-asl.js`

2. Copy the plugin to your Kiwi webserver

   The plugin file must be loadable from a webserver. Creating a `plugins/` folder with your KiwiIRC files is a good place to put it.

3. Add the plugin to KiwiIRC

   In your kiwi `config.json` file, find the `plugins` section and add:
   ```json
   {"name": "asl", "url": "/plugins/plugin-custom-startup-asl.js"}
   ```
    
   To enable the startup screen, tell KiwiIRC to use the startup screen from the plugin. Set `"startupScreen"` to `custom-welcome`.

## License

[Licensed under the Apache License, Version 2.0](LICENSE).

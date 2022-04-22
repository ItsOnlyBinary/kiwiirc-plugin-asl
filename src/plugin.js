import CustomWelcome from './components/CustomWelcome.vue';
import CustomUserBox from './components/CustomUserBox.vue';
import UserBrowserButton from './components/UserBrowserButton.vue';
import * as config from './config.js';
import * as utils from './libs/utils.js';

import fallbackLocale from '../res/locales/en-us.json';

// eslint-disable-next-line no-undef
kiwi.plugin('asl', (kiwi, log) => {
    config.setDefaults(kiwi);

    // setup the plugins locales
    let localesPath = kiwi.state.getSetting('settings.plugin-asl.localesPath');
    if (localesPath.includes('{{lng}}')) {
        kiwi.addTranslationFiles('plugin-asl', localesPath, fallbackLocale);
    } else {
        log.error('localesPath is missing {{lng}}, please update your config.json');
    }

    // add the custom welcome screen and replace userbox
    kiwi.addStartup('plugin-asl', CustomWelcome);
    kiwi.replaceModule('components/UserBox', CustomUserBox);

    // show the user browser if its enabled
    if (kiwi.state.getSetting('settings.plugin-asl.showUserBrowser')) {
        // add a button to channel headers to open the sidebar component
        kiwi.addUi('header_channel', UserBrowserButton);
    }

    // handle user joining one of the channels
    kiwi.on('irc.join', (event, net) => {
        if (event.gecos) {
            updateUser(net, {
                nick: event.nick,
                username: event.ident,
                host: event.hostname,
                realname: event.gecos,
            });
        } else {
            // if extended-join is not enabled we wont have the user gecos
            // so we will have to get it via a who request
            net.ircClient.who(event.nick);
        }
    });

    // handle incoming who response
    kiwi.on('irc.wholist', (event, net) => {
        event.users.forEach((user) => {
            updateUser(net, {
                nick: user.nick,
                realname: user.real_name,
            });
        });
    });

    function updateUser(net, user) {
        let userObj = kiwi.state.getUser(net.id, user.nick) || kiwi.state.addUser(net, user);
        let parsedGecos = utils.parseGecos(user.realname);
        userObj.asl = parsedGecos.asl;
        userObj.aslRealname = parsedGecos.realname;
        userObj.colour = utils.getColour(userObj.asl);
    }
});

import CustomWelcome from './components/CustomWelcome.vue';
import CustomUserBox from './components/CustomUserBox.vue';
import UserBrowser from './components/UserBrowser.vue';
import UserBrowserButton from './components/UserBrowserButton.vue';
import Locales from './libs/locales.js';
import * as config from './config.js';
import * as utils from './libs/utils.js';

// eslint-disable-next-line no-undef
kiwi.plugin('asl', (kiwi) => {
    config.setDefaults();

    // setup the plugins locales
    let localesPath = kiwi.state.getSetting('settings.plugin-asl.localesPath');
    let locales = new Locales();
    locales.init(localesPath, 'plugin-asl', 'age');

    // add the custom welcome screen and replace userbox
    kiwi.addStartup('plugin-asl', CustomWelcome);
    kiwi.replaceModule('components/UserBox', CustomUserBox);

    // show the user browser if its enabled
    if (kiwi.state.getSetting('settings.plugin-asl.showUserBrowser')) {
        // add user browser component to channel sidebar
        kiwi.addTab('channel', 'UserBrowser', UserBrowser, {});

        // add a button to channel headers to open the sidebar component
        let browserButton = new kiwi.Vue(UserBrowserButton);
        browserButton.$mount();
        kiwi.addUi('header_channel', browserButton.$el);
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

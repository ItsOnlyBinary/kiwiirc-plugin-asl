import CustomWelcome from './components/CustomWelcome.vue';
import CustomUserBox from './components/CustomUserBox.vue';
import UserBrowser from './components/UserBrowser.vue';
import UserBrowserButton from './components/UserBrowserButton.vue';
import * as config from './config.js';
import * as utils from './libs/utils.js';

// eslint-disable-next-line no-undef
kiwi.plugin('custom-welcome', (kiwi) => {
    config.setDefaults();
    kiwi.addStartup('custom-welcome', CustomWelcome);
    kiwi.replaceModule('components/UserBox', CustomUserBox);

    if (kiwi.state.getSetting('settings.plugin-asl.showUserBrowser')) {
        let title = kiwi.state.getSetting('settings.plugin-asl.strings.browseUsers');
        kiwi.addTab('channel', title, UserBrowser, {});
        let browserButton = new kiwi.Vue(UserBrowserButton);
        browserButton.$mount();
        kiwi.addUi('header_channel', browserButton.$el);
    }

    kiwi.on('irc.join', (event, net) => {
        if (event.gecos) {
            updateUser(net, event.gecos, {
                nick: event.nick,
                username: event.ident,
                host: event.hostname,
                realname: event.gecos,
            });
        } else {
            net.ircClient.who(event.nick);
        }
    });

    kiwi.on('irc.wholist', (event, net) => {
        event.users.forEach((user) => {
            updateUser(net, user.real_name, {
                nick: user.nick,
            });
        });
    });

    function updateUser(net, gecos, _user) {
        let user = _user;
        let parsedGecos = utils.parseGecos(gecos);
        let userObj = kiwi.state.getUser(net.id, user.nick);
        if (!userObj) {
            // if the user does not exist it cannot be updated
            // meaning that asl props do not get added
            kiwi.state.addUser(net, user);
        }
        user.asl = parsedGecos.asl;
        user.aslRealname = parsedGecos.realname;
        user.colour = utils.getColour(user.asl);
        kiwi.state.addUser(net, user);
    }
});

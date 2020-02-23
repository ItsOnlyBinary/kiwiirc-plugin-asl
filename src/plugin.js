import CustomWelcome from './components/CustomWelcome.vue';
import CustomUserBox from './components/CustomUserBox.vue';
import UserBrowser from './components/UserBrowser.vue';
import UserBrowserButton from './components/UserBrowserButton.vue';
import * as config from './config.js';
import * as utils from './libs/utils.js';

// eslint-disable-next-line no-undef
kiwi.plugin('asl', (kiwi) => {
    config.setDefaults();
    kiwi.addStartup('plugin-asl', CustomWelcome);
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
            updateUser(net, {
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

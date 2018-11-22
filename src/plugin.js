import CustomWelcome from './components/CustomWelcome.vue';
import CustomUserBox from './components/CustomUserBox.vue';
import * as utils from './libs/utils.js';

// eslint-disable-next-line no-undef
kiwi.plugin('custom-welcome', (kiwi) => {
    kiwi.addStartup('custom-welcome', CustomWelcome);
    kiwi.replaceModule('components/UserBox', CustomUserBox);

    kiwi.on('irc.join', function(event, net) {
        if (event.gecos) {
            kiwi.state.addUser(net, {
                nick: event.nick,
                username: event.ident,
                host: event.hostname,
                realname: event.gecos,
                colour: getColour(event.gecos),
            });
        } else {
            net.ircClient.who(event.nick);
        }
    });

    kiwi.on('irc.wholist', function(event, net) {
        event.users.forEach((user) => {
            kiwi.state.addUser(net, {
                nick: user.nick,
                colour: getColour(user.real_name),
            });
        });
    });

    function getColour(gecos) {
        let asl = utils.getASL(gecos);

        switch (asl.s) {
        case 'Male':
            return '#00F';
        case 'Female':
            return '#F0F';
        case 'Other':
            return '#0F0';
        default:
            return '#000';
        }
    }
});


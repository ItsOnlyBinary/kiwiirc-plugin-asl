import CustomWelcome from './components/CustomWelcome.vue';
import CustomUserBox from './components/CustomUserBox.vue';
import * as utils from './libs/utils.js';

// eslint-disable-next-line no-undef
kiwi.plugin('custom-welcome', (kiwi) => {
    kiwi.addStartup('custom-welcome', CustomWelcome);
    kiwi.replaceModule('components/UserBox', CustomUserBox);

    kiwi.on('irc.join', function(event, net) {
        if (event.gecos) {
            setColour(net, event.nick , event.gecos);
        }
    });

    kiwi.on('irc.wholist', function(event, net) {
        event.users.forEach((user) => {
            setColour(net, user.nick, user.real_name);
        });
    });

    function setColour(net, nick, gecos) {
        let asl = utils.getASL(gecos);
        let colour;

        switch (asl.s) {
        case 'Male':
            colour = '#00F';
            break;
        case 'Female':
            colour = '#F0F';
            break;
        case 'Other':
            colour = '#0F0';
            break;
        default:
            colour = '#000';
        }

        kiwi.state.addUser(net, { nick, colour });
    }
});


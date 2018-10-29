import CustomWelcome from './components/CustomWelcome.vue';
import CustomUserBox from './components/CustomUserBox.vue';
import * as utils from './libs/utils.js';

// eslint-disable-next-line no-undef
kiwi.plugin('custom-welcome', (kiwi) => {
    kiwi.addStartup('custom-welcome', CustomWelcome);
    kiwi.replaceModule('components/UserBox', CustomUserBox);

    kiwi.on('irc.wholist', function(event, net) {
        event.users.forEach((user) => {
            let userObj = kiwi.state.getUser(net.id, user.nick);
            let asl = (user.nick === net.nick) ?
                utils.getASL(net.gecos) :
                utils.getASL(userObj.realname);

            switch (asl.s) {
            case 'Male':
                userObj.colour = '#00F';
                break;
            case 'Female':
                userObj.colour = '#F0F';
                break;
            case 'Other':
                userObj.colour = '#0F0';
                break;
            default:
                userObj.colour = '#000';
            }
        });
    });
});


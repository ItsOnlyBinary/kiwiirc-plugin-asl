import CustomWelcome from './components/CustomWelcome.vue';
import CustomUserBox from './components/CustomUserBox.vue';
import CustomNicklistUser from './components/CustomNicklistUser.vue';
import * as utils from './libs/utils.js';

// eslint-disable-next-line no-undef
kiwi.plugin('custom-welcome', (kiwi) => {
    kiwi.addStartup('custom-welcome', CustomWelcome);
    kiwi.replaceModule('components/UserBox', CustomUserBox);
    kiwi.replaceModule('components/NicklistUser', CustomNicklistUser);
    
    let icons = true;
    let colours = true;
    
    if(kiwi.state.setting('asl.icons')) {
        icons = kiwi.state.setting('asl.icons');
    }

    if(kiwi.state.setting('asl.colours')) {
        colours = kiwi.state.setting('asl.colours');
    }
    
    kiwi.on('irc.join', function(event, net) {
        if (event.gecos) {
            kiwi.state.addUser(net, {
                nick: event.nick,
                username: event.ident,
                host: event.hostname,
                realname: event.gecos,
                colour: (colours == true ) ? getColour(event.gecos) : '',
                gender : (icons == true ) ? getGender(event.gecos) : null ,
            });
        }
    });

    kiwi.on('irc.wholist', function(event, net) {
        event.users.forEach((user) => {
            kiwi.state.addUser(net, {
                nick: user.nick,
                colour: (colours == true ) ? getColour(user.real_name) : '',
                gender : (icons == true ) ? getGender(user.real_name) : null ,
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

    function getGender(gecos) {
        let asl = utils.getASL(gecos);
        return asl.s;
    }

});
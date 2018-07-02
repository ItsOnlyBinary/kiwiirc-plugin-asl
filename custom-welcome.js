import CustomWelcome from './components/CustomWelcome.vue';
import CustomUserBox from './components/CustomUserBox.vue';

// eslint-disable-next-line no-undef
kiwi.plugin('custom-welcome', (kiwi) => {
    kiwi.addStartup('custom-welcome', CustomWelcome);
    kiwi.replaceModule('components/UserBox', CustomUserBox);
});

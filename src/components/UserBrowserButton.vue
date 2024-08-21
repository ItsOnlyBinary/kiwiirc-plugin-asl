<template id="user-browser">
    <div :class="[isActive ? 'kiwi-header-option--active' : '']" class="kiwi-header-option">
        <a @click.prevent="toggleUserBrowser">
            <i :class="icon" class="fa" aria-hidden="true" />
        </a>
    </div>
</template>

<script>
/* global kiwi:true */

import UserBrowser from '@/components/UserBrowser.vue';

import * as config from '@/config.js';

export default {
    props: ['sidebarState'],
    computed: {
        isActive() {
            return (
                (this.sidebarState.isOpen || this.sidebarState.isDrawn) &&
                this.sidebarState.activeComponentProps?.componentName === 'PluginASLUserBrowser'
            );
        },
        icon() {
            return config.getSetting('userBrowserIcon');
        },
    },
    created() {
        this.listen(this.$state, 'plugin-asl.userbrowser.close', () => {
            if (this.isActive) {
                kiwi.showInSidebar(null);
            }
        });
    },
    methods: {
        toggleUserBrowser() {
            if (this.isActive) {
                kiwi.showInSidebar(null);
                return;
            }
            kiwi.showInSidebar(UserBrowser, { componentName: 'PluginASLUserBrowser' });
        },
    },
};
</script>

<template id="user-browser">
    <div :class="[active ? 'kiwi-header-option--active': '']" class="kiwi-header-option">
        <a @click.prevent="toggleUserBrowser">
            <i :class="icon" class="fa" aria-hidden="true"/>
        </a>
    </div>
</template>

<script>

/* global kiwi:true */

import * as config from '../config.js';
import UserBrowser from './UserBrowser.vue';

export default {
    data() {
        return {
            active: false,
        };
    },
    computed: {
        icon() {
            return config.getSetting('userBrowserIcon');
        },
    },
    created() {
        this.listen(this.$state, 'plugin-asl.userbrowser.close', () => {
            this.active = false;
        });
    },
    methods: {
        toggleUserBrowser() {
            kiwi.showInSidebar(this.active ? null : UserBrowser);
            this.active = true;
        },
    },
};
</script>

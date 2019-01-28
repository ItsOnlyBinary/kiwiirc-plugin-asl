<template>
    <li
        :class="[
            nicklist.userMode(user) ? 'kiwi-nicklist-user--mode-' + nicklist.userMode(user) : '',
            user.away ? 'kiwi-nicklist-user--away' : '',
            user.ignore ? 'kiwi-nicklist-user--ignore' : '',
            user.gender ? 'kiwi-nicklist-user--gender-' + user.gender : '',
        ]"
        class="kiwi-nicklist-user"
        @click="nicklist.openUserbox(user)"
    >
        <span class="kiwi-nicklist-user-prefix">{{ nicklist.userModePrefix(user) }}</span>
        <span :style="{ 'color': userColour }"
              class="kiwi-nicklist-user-nick"
        >{{ user.nick }}
        </span>
        <span class="kiwi-nicklist-messageuser" @click.stop="nicklist.openQuery(user)">
            <i class="fa fa-comment" aria-hidden="true"/>
        </span>
    </li>
</template>

<script>

'kiwi public';

export default {
    props: ['user', 'nicklist'],
    computed: {
        userColour() {
            if (this.nicklist.useColouredNicks) {
                return this.user.getColour();
            }
            return '';
        },

    },
};
</script>

<style>

.kiwi-nicklist-user {
    line-height: 26px;
    padding: 0 16px 0 12px;
    margin: 0;
    position: relative;
    box-sizing: border-box;
    transition: all 0.1s;
    cursor: pointer;
}

.kiwi-nicklist-user--away .kiwi-nicklist-user-nick {
    opacity: 0.5;
    color:grey !important;
}

.kiwi-nicklist-user--away .kiwi-nicklist-user-nick::after {
    content:"Away";
    font-size: 0.25em;
    vertical-align: super;
}

.kiwi-nicklist-user--gender-Male .kiwi-nicklist-user-nick::after {
    content:"\f222";
    font-size: 0.25em;
    vertical-align: super;
    font-family: fontawesome;
}

.kiwi-nicklist-user--gender-Female .kiwi-nicklist-user-nick::after {
    content:"\f221";
    font-size: 0.25em;
    vertical-align: super;
    font-family: fontawesome;
}

.kiwi-nicklist-user--gender-Other .kiwi-nicklist-user-nick::after {
    content:"\f224";
    font-size: 0.25em;
    vertical-align: super;
    font-family: fontawesome;
}

.kiwi-nicklist-user--away.kiwi-nicklist-user--gender-Male .kiwi-nicklist-user-nick::after {
    content:"\f222 Away";
    font-size: 0.25em;
    vertical-align: super;
    font-family: fontawesome;
}

.kiwi-nicklist-user--away.kiwi-nicklist-user--gender-Female .kiwi-nicklist-user-nick::after {
    content:"\f221 Away";
    font-size: 0.25em;
    vertical-align: super;
    font-family: fontawesome;
}

.kiwi-nicklist-user--away.kiwi-nicklist-user--gender-Other .kiwi-nicklist-user-nick::after {
    content:"\f224 Away";
    font-size: 0.25em;
    vertical-align: super;
    font-family: fontawesome;
}


.kiwi-nicklist-user-nick {
    font-weight: bold;
    cursor: pointer;
}

.kiwi-nicklist-messageuser {
    position: absolute;
    content: '\f075';
    right: -1em;
    font-family: fontAwesome, sans-serif;
    line-height: 30px;
    opacity: 0;
    transition: all 0.1s;
}

.kiwi-nicklist-user:hover .kiwi-nicklist-messageuser {
    opacity: 1;
    right: 1em;
    transition: all 0.2s;
    transition-delay: 0.1s;
}

</style>

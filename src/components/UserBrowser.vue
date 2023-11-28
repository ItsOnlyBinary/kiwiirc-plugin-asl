<template>
    <div class="plugin-asl-userbrowser-container">
        <div class="plugin-asl-userbrowser-options u-form">
            <div
                v-for="sexObj of sexes"
                :key="'sexes-' + sexObj.name"
                class="plugin-asl-userbrowser-option"
            >
                <input
                    :id="'asl-' + sexObj.name"
                    :checked="selectedSexes[sexObj.name]"
                    type="checkbox"
                    @change="toggleSex($event, sexObj.name)"
                >
                <label :for="'asl-' + sexObj.name" :style="{ color: getSexColour(sexObj) }">
                    {{
                        sexObj.name[0] === '_'
                            ? $t('plugin-asl:' + sexObj.name.substr(1))
                            : sexObj.name
                    }}
                </label>
            </div>
        </div>
        <div class="plugin-asl-userbrowser-options u-form">
            <div class="plugin-asl-userbrowser-option">
                <label for="asl-range">
                    {{ $t('plugin-asl:range') }}
                </label>
                <select
                    id="asl-range"
                    v-model="age"
                    class="plugin-asl-userbrowser-ages"
                    @change="updateSelectedAgeRange()"
                >
                    <option
                        v-for="ageRange in ageRanges"
                        :key="'agerange-' + ageRange.value"
                        :value="ageRange.value"
                    >
                        {{
                            ageRange.name[0] === '_'
                                ? $t('plugin-asl:' + ageRange.name.substr(1))
                                : ageRange.name
                        }}
                    </option>
                </select>
            </div>
            <div class="plugin-asl-userbrowser-option">
                <input id="asl-global" v-model="showGlobal" type="checkbox">
                <label for="asl-global">
                    {{ $t('plugin-asl:global') }}
                </label>
            </div>
        </div>
        <div class="plugin-asl-userbrowser-filter u-form">
            <input
                v-model="filter"
                class="u-input"
                type="text"
                :placeholder="$t('plugin-asl:filter')"
                @change="updateUserFilter()"
            >
            <i v-if="filter !== ''" class="fa fa-undo" aria-hidden="true" @click="filter = ''" />
        </div>
        <div class="plugin-asl-userbrowser-users">
            <table class="plugin-asl-userbrowser-users-table">
                <tr>
                    <th style="width: 35%; text-align: left;">{{ $t('nick') }}</th>
                    <th style="width: 15%;">{{ $t('plugin-asl:age') }}</th>
                    <th style="width: 50%; text-align: left;">{{ $t('plugin-asl:location') }}</th>
                </tr>
                <tr v-for="user in filteredUsers" :key="'users-' + user.nick">
                    <td
                        :style="{ color: user.getColour() }"
                        class="plugin-asl-userbrowser-users-nick"
                        @click.stop="openUserbox(user)"
                    >
                        {{ user.nick }}
                    </td>
                    <td class="plugin-asl-userbrowser-users-age">{{ user.asl.a || '&nbsp;' }}</td>
                    <td>{{ user.asl.l || '&nbsp;' }}</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
/* global kiwi:true */
/* global _:true */

import * as config from '../config.js';
import * as colours from '../libs/colours.js';

const TextFormatting = kiwi.require('helpers/TextFormatting');

export default {
    props: ['network', 'buffer', 'sidebarState'],
    data() {
        return {
            showGlobal: false,
            sexes: {},
            selectedSexes: {},
            ageRanges: [],
            age: '',
            filter: '',
        };
    },
    computed: {
        filteredUsers() {
            let bufferUsers = this.showGlobal
                ? Object.values(this.network.users)
                : this.buffer.users;

            if (this.showGlobal) {
                this.network.buffers.forEach((buffer) => {
                    // Noop so it updates if any buffer.users change
                    // eslint-disable-next-line no-unused-expressions
                    buffer.users;
                });
            }

            let filter = this.filter.toLowerCase();
            return _.filter(bufferUsers, (user) => {
                if (!user.asl) {
                    return false;
                }

                // dont show self in the list
                if (user.nick === this.network.currentUser().nick) {
                    return false;
                }

                // Filter by sex
                if (!this.selectedSexes[user.asl.s]) {
                    return false;
                }

                // Filter by age
                if (this.age[0] === '<' && user.asl.a >= parseInt(this.age.slice(1), 10)) {
                    return false;
                }
                if (this.age[0] === '>' && user.asl.a <= parseInt(this.age.slice(1), 10)) {
                    return false;
                }
                let range = this.age.split('-');
                if (range.length === 2 && (user.asl.a < range[0] || user.asl.a > range[1])) {
                    return false;
                }

                // Filter by nick
                if (user.nick.toLowerCase().indexOf(filter) !== -1) {
                    return true;
                }

                // Filter by location
                if (user.asl.l && user.asl.l.toLowerCase().indexOf(filter) !== -1) {
                    return true;
                }

                return false;
            });
        },
    },
    created() {
        this.showGlobal = config.setting('userBrowserGlobal');
        this.sexes = config.setting('sexes');
        this.ageRanges = config.setting('ageRanges');
        this.age = this.$state.pluginASL.selectedAgeRange;
        this.selectedSexes = this.$state.pluginASL.selectedSexes;
        this.filter = this.$state.pluginASL.userFilter;
    },
    beforeDestroy() {
        this.$state.$emit('plugin-asl.userbrowser.close');
    },
    methods: {
        openUserbox(user) {
            this.$state.$emit('userbox.show', user, {
                buffer: this.buffer,
            });
        },
        toggleSex(event, name) {
            this.selectedSexes[name] = event.target.checked;
            this.$state.pluginASL.selectedSexes = this.selectedSexes;
        },
        updateSelectedAgeRange() {
            this.$state.pluginASL.selectedAgeRange = this.age;
        },
        updateUserFilter() {
            this.$state.pluginASL.userFilter = this.filter;
        },
        getSexColour(sexObj) {
            const sexRGB = colours.normaliseColour(sexObj.colour);
            const sexHSL = colours.rgb2hsl(sexRGB);
            const lightness = TextFormatting.toInt(kiwi.themes.themeVar('nickcolour-lightness'));
            if (lightness) {
                sexHSL.l = lightness;
            }

            return colours.hsl2String(sexHSL);
        },
    },
};
</script>

<style>
.plugin-asl-userbrowser-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
}

.plugin-asl-userbrowser-options {
    display: flex;
    flex-flow: row wrap;
    gap: 14px;
}

.plugin-asl-userbrowser-option {
    display: flex;
    align-items: center;
    white-space: nowrap;
}

.plugin-asl-userbrowser-option label {
    font-weight: 700;
}

.plugin-asl-userbrowser-ages {
    margin-left: 7px;
}

.plugin-asl-userbrowser-filter {
    width: 100%;
}

.plugin-asl-userbrowser-filter input {
    width: 300px;
}

.plugin-asl-userbrowser-filter i {
    margin-left: 10px;
}

.plugin-asl-userbrowser-users {
    height: 100%;
    margin: 4px;
    overflow-y: auto;
}

.plugin-asl-userbrowser-users-table {
    width: 100%;
    border-collapse: collapse;
}

.plugin-asl-userbrowser-users-table tr:nth-child(even) {
    background: rgba(0, 0, 0, 0.1);
}

.plugin-asl-userbrowser-users-table td,
.plugin-asl-userbrowser-users-table th {
    padding: 0 4px;
}

.plugin-asl-userbrowser-users-nick {
    font-weight: bold;
    cursor: pointer;
}

.plugin-asl-userbrowser-users-age {
    text-align: center;
}
</style>

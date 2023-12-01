<template>
    <div class="p-asl-userbrowser-container">
        <div class="p-asl-userbrowser-options u-form">
            <div v-for="sexObj of sexes" :key="'sexes-' + sexObj.name" class="p-asl-userbrowser-option">
                <input
                    :id="'asl-' + sexObj.name"
                    :checked="selectedSexes[sexObj.name]"
                    type="checkbox"
                    @change="toggleSex($event, sexObj.name)"
                />
                <label :for="'asl-' + sexObj.name" :style="{ color: getSexColour(sexObj) }">
                    {{ sexObj.name[0] === '_' ? $t('plugin-asl:' + sexObj.name.substr(1)) : sexObj.name }}
                </label>
            </div>
        </div>
        <div class="p-asl-userbrowser-options u-form">
            <div class="p-asl-userbrowser-option">
                <label for="asl-range">
                    {{ $t('plugin-asl:range') }}
                </label>
                <select
                    id="asl-range"
                    v-model="age"
                    class="p-asl-userbrowser-ages"
                    @change="updateSelectedAgeRange()"
                >
                    <option v-for="ageRange in ageRanges" :key="'agerange-' + ageRange.value" :value="ageRange.value">
                        {{ ageRange.name[0] === '_' ? $t('plugin-asl:' + ageRange.name.substr(1)) : ageRange.name }}
                    </option>
                </select>
            </div>
            <div class="p-asl-userbrowser-option">
                <input id="asl-global" v-model="showGlobal" type="checkbox" />
                <label for="asl-global">
                    {{ $t('plugin-asl:global') }}
                </label>
            </div>
        </div>
        <div class="p-asl-userbrowser-filter u-form">
            <input
                v-model="filter"
                class="u-input"
                type="text"
                :placeholder="$t('plugin-asl:filter')"
                @change="updateUserFilter()"
            />
            <i v-if="filter !== ''" class="fa fa-undo" aria-hidden="true" @click="filter = ''" />
        </div>
        <div class="p-asl-userbrowser-users">
            <table class="p-asl-userbrowser-table">
                <tr>
                    <th style="width: 35%; text-align: left">{{ $t('nick') }}</th>
                    <th style="width: 15%">{{ $t('plugin-asl:age') }}</th>
                    <th style="width: 50%; text-align: left">{{ $t('plugin-asl:location') }}</th>
                </tr>
                <tr v-for="user in filteredUsers" :key="'table-' + user.nick">
                    <td
                        :style="{ color: user.getColour() }"
                        class="p-asl-userbrowser-table-nick"
                        @click.stop="openUserbox(user)"
                    >
                        {{ user.nick }}
                    </td>
                    <td class="p-asl-userbrowser-table-age">{{ user.asl.a || '&nbsp;' }}</td>
                    <td>{{ user.asl.l || '&nbsp;' }}</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
/* global kiwi:true */
/* global _:true */

import * as config from '@/config.js';
import * as colours from '@/libs/colours.js';

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
            const bufferUsers = this.showGlobal ? Object.values(this.network.users) : this.buffer.users;

            if (this.showGlobal) {
                this.network.buffers.forEach((buffer) => {
                    // Noop so it updates if any buffer.users change
                    // eslint-disable-next-line no-unused-expressions
                    buffer.users;
                });
            }

            const filter = this.filter.toLowerCase();
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
                const range = this.age.split('-');
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

<style lang="scss">
.p-asl-userbrowser-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
    height: 100%;
    padding: 10px;
}

.p-asl-userbrowser-options {
    display: flex;
    flex-flow: row wrap;
    gap: 14px;
}

.p-asl-userbrowser-option {
    display: flex;
    align-items: center;
    white-space: nowrap;

    label {
        font-weight: 700;
    }
}

.p-asl-userbrowser-ages {
    margin-left: 7px;
}

.p-asl-userbrowser-filter {
    width: 100%;

    input {
        width: 300px;
    }

    i {
        margin-left: 10px;
    }
}

.p-asl-userbrowser-users {
    height: 100%;
    margin: 4px;
    overflow-y: auto;
}

.p-asl-userbrowser-table {
    width: 100%;
    border-collapse: collapse;

    td,
    th {
        padding: 0 4px;
    }

    tr:nth-child(even) {
        background: rgba(0, 0, 0, 0.1);
    }
}

.p-asl-userbrowser-table-nick {
    font-weight: bold;
    cursor: pointer;
}

.p-asl-userbrowser-table-age {
    text-align: center;
}
</style>

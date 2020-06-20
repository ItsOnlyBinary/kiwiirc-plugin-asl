<template>
    <div class="plugin-asl-userbrowser-container">
        <div class="u-form">
            <div
                v-for="(value, name) in sexes"
                :key="'sexes-'+name"
                class="plugin-asl-userbrowser-sexes"
            >
                <input
                    :id="'asl-'+name"
                    :checked="selectedSexes[name]"
                    type="checkbox"
                    @change="toggleSex($event, name)"
                >
                <label :for="'asl-'+name" :style="{ 'color': sexes[name].colour }">
                    {{ name[0] === '_' ? $t('plugin-asl:' + name.substr(1)) : name }}
                </label>
            </div>
            <select
                v-model="age"
                class="plugin-asl-userbrowser-ages"
                @change="updateSelectedAgeRange()"
            >
                <option
                    v-for="ageRange in ageRanges"
                    :key="'agerange-'+ageRange.value"
                    :value="ageRange.value"
                >
                    {{
                        ageRange.name[0] === '_' ?
                            $t('plugin-asl:' + ageRange.name.substr(1)) :
                            ageRange.name
                    }}
                </option>
            </select>
        </div>
        <div class="plugin-asl-userbrowser-filter u-form">
            <input v-model="filter" class="u.input" type="text" @change="updateUserFilter()">
            <i v-if="filter !== ''" class="fa fa-undo" aria-hidden="true" @click="filter = ''"/>
        </div>
        <div class="plugin-asl-userbrowser-users">
            <table class="plugin-asl-userbrowser-users-table">
                <tr>
                    <th style="width: 35%; text-align: left;">{{ $t('nick') }}</th>
                    <th style="width: 15%;">{{ $t('plugin-asl:age') }}</th>
                    <th style="width: 50%; text-align: left;">{{ $t('plugin-asl:location') }}</th>
                </tr>
                <tr v-for="user in filteredUsers" :key="'users-'+user.nick">
                    <td
                        :style="{ 'color': user.colour }"
                        class="plugin-asl-userbrowser-users-nick"
                        @click.stop="openUserbox(user);"
                    >{{ user.nick }}</td>
                    <td class="plugin-asl-userbrowser-users-age">{{ user.asl.a || '&nbsp;' }}</td>
                    <td>{{ user.asl.l || '&nbsp;' }}</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>

/* global _:true */
/* global kiwi:true */

export default {
    props: ['network', 'buffer', 'sidebarState'],
    data() {
        return {
            sexes: {},
            selectedSexes: {},
            ageRanges: [],
            age: '',
            filter: '',
        };
    },
    computed: {
        filteredUsers() {
            let bufferUsers = this.buffer.users;
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
                let sexesKeys = Object.keys(this.sexes);
                for (let i = 0; i < sexesKeys.length; i++) {
                    let sex = sexesKeys[i];
                    if (user.asl.s === sex && !this.selectedSexes[sex]) {
                        return false;
                    }
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
        this.sexes = kiwi.state.setting('plugin-asl.sexes');
        this.ageRanges = kiwi.state.setting('plugin-asl.ageRanges');
        this.age = kiwi.state.pluginASL.selectedAgeRange;
        this.selectedSexes = kiwi.state.pluginASL.selectedSexes;
        this.filter = kiwi.state.pluginASL.userFilter;
    },
    beforeDestroy() {
        kiwi.state.$emit('plugin-asl.userbrowser.close');
    },
    methods: {
        openUserbox(user) {
            kiwi.state.$emit('userbox.show', user, {
                buffer: this.buffer,
            });
        },
        toggleSex(event, name) {
            this.selectedSexes[name] = event.target.checked;
            kiwi.state.pluginASL.selectedSexes = this.selectedSexes;
        },
        updateSelectedAgeRange() {
            kiwi.state.pluginASL.selectedAgeRange = this.age;
        },
        updateUserFilter() {
            kiwi.state.pluginASL.userFilter = this.filter;
        },
    },
};
</script>

<style>
.plugin-asl-userbrowser-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.plugin-asl-userbrowser-sexes {
    display: inline-block;
    font-weight: bold;
    margin: 4px 4px 4px 10px;
}

.plugin-asl-userbrowser-sexes input,
.plugin-asl-userbrowser-sexes label {
    vertical-align: middle;
    display: inline-block;
}

.plugin-asl-userbrowser-ages {
    margin: 4px;
}

.plugin-asl-userbrowser-filter {
    margin-left: 10px;
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

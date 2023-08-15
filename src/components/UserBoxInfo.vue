<template>
    <div class="kiwi-userbox-basicinfo">
        <div v-if="user.asl && singleLine">
            <span class="kiwi-userbox-basicinfo-title">{{ $t('plugin-asl:info') }}:</span>
            <span class="kiwi-userbox-basicinfo-data">{{ aslString }}</span>
        </div>
        <div v-else-if="user.asl">
            <div v-if="user.asl.a">
                <span class="kiwi-userbox-basicinfo-title">{{ $t('plugin-asl:age') }}:</span>
                <span class="kiwi-userbox-basicinfo-data">{{ user.asl.a }}</span>
            </div>
            <div v-if="user.asl.s">
                <span class="kiwi-userbox-basicinfo-title">{{ $t('plugin-asl:sex') }}:</span>
                <span class="kiwi-userbox-basicinfo-data">
                    {{
                        user.asl.s[0] === '_'
                            ? $t('plugin-asl:' + user.asl.s.substr(1))
                            : user.asl.s
                    }}
                </span>
            </div>
            <div v-if="user.asl.l">
                <span class="kiwi-userbox-basicinfo-title">{{ $t('plugin-asl:location') }}:</span>
                <span class="kiwi-userbox-basicinfo-data">{{ user.asl.l }}</span>
            </div>
        </div>
        <div v-if="user.aslRealname">
            <span class="kiwi-userbox-basicinfo-title">{{ $t('whois_realname') }}:</span>
            <span class="kiwi-userbox-basicinfo-data" v-html="formattedRealname" />
        </div>
    </div>
</template>

<script>
/* global kiwi:true */

import * as config from '../config.js';

let toHtml = kiwi.require('libs/renderers/Html');
let parseMessage = kiwi.require('libs/MessageParser');
let TextFormatting = kiwi.require('helpers/TextFormatting');

export default {
    props: ['user'],
    computed: {
        singleLine() {
            return config.getSetting('singleLineUserbox');
        },
        aslString() {
            let parts = config.getSetting('singleLineString');
            let out = [];
            if (this.user.asl.a) {
                out.push(parts.age.replace('%a', this.user.asl.a));
            }
            if (this.user.asl.s) {
                let sex =
                    this.user.asl.s[0] === '_'
                        ? TextFormatting.t('plugin-asl:' + this.user.asl.s.substr(1))
                        : this.user.asl.s;
                out.push(parts.sex.replace('%s', sex));
            }
            if (this.user.asl.l) {
                out.push(parts.location.replace('%l', this.user.asl.l));
            }
            return out.join(parts.separator);
        },
        formattedRealname() {
            let blocks = parseMessage(this.user.aslRealname || '', { extras: false });
            let content = toHtml(blocks, false);
            return content;
        },
    },
};
</script>

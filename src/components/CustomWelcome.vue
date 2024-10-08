<template>
    <startup-layout
        ref="layout"
        class="kiwi-welcome-simple"
    >
        <template v-if="startupOptions.altComponent" #connection>
            <component :is="startupOptions.altComponent" @close="onAltClose" />
        </template>
        <template v-else #connection>
            <form class="u-form u-form--big kiwi-welcome-simple-form" @submit.prevent="formSubmit">
                <h2 v-html="greetingText" />
                <div
                    v-if="network && (connectErrors.length > 0 || network.state_error)"
                    class="kiwi-welcome-simple-error"
                >
                    <template v-if="connectErrors.length > 0">
                        <span v-for="err in connectErrors" :key="err">{{ err }}</span>
                    </template>
                    <template v-else>
                        <span>{{ $t('network_noconnect') }}</span>
                        <span>{{ readableStateError(network.state_error) }}</span>
                    </template>
                </div>

                <input-text
                    v-model="nick"
                    v-focus="!isIframe && (!nick || !show_password_box)"
                    :label="$t('nick')"
                    type="text"
                    :class="{'kiwi-welcome-invalid-nick': !isNickValid}"
                />

                <div v-if="showPass && toggablePass" class="kiwi-welcome-simple-input-container">
                    <label
                        class="kiwi-welcome-simple-have-password"
                    >
                        <input v-model="show_password_box" type="checkbox">
                        <span> {{ $t('password_have') }} </span>
                    </label>
                </div>

                <div
                    v-if="showPass && (show_password_box || !toggablePass)"
                    class="kiwi-welcome-simple-input-container"
                >
                    <input-text
                        v-model="password"
                        v-focus="(!isIframe && nick) || show_password_box"
                        :show-plain-text="true"
                        :label="$t('password')"
                        type="password"
                    />
                </div>
                <div class="kiwi-welcome-simple-asl-container">
                    <div class="kiwi-welcome-simple-age-sex">
                        <input-text
                            v-model="age"
                            :label="$t('plugin-asl:age')"
                            :min="allowedAge.min"
                            :max="allowedAge.max"
                            :class="{'kiwi-input-invalid': !isAgeValid}"
                            class="kiwi-welcome-simple-age"
                            type="number"
                        />
                        <div class="kiwi-welcome-simple-sex">
                            <label>{{ $t('plugin-asl:sex') }}</label>
                            <div class="kiwi-welcome-simple-sex-select">
                                <select
                                    v-model="sex"
                                    class="u-input"
                                    :class="{'kiwi-input-invalid': !isSexValid}"
                                >
                                    <option :value="null" selected disabled>
                                        {{ $t('plugin-asl:select') }}
                                    </option>
                                    <option
                                        v-for="sexObj of sexes"
                                        :key="'sexes-' + sexObj.name"
                                        :value="sexObj.chars[0]"
                                        :style="{ color: sexObj.colour }"
                                    >{{
                                        sexObj.name[0] === '_'
                                            ? $t('plugin-asl:' + sexObj.name.substr(1))
                                            : sexObj.name
                                    }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <input-text
                        v-if="showLocation"
                        v-model="location"
                        :label="$t('plugin-asl:location')"
                        :class="{'kiwi-input-invalid': !isLocationValid}"
                    />
                    <input-text
                        v-if="showRealname"
                        v-model="realname"
                        :label="$t('whois_realname')"
                        :class="{'kiwi-input-invalid': !isRealnameValid}"
                    />
                </div>

                <div v-if="showChannel" class="kiwi-welcome-simple-input-container">
                    <input-text
                        v-model="channel"
                        :label="$t('channel')"
                    />
                </div>

                <div v-if="termsContent" class="kiwi-welcome-simple-terms">
                    <div>
                        <input v-model="termsAccepted" type="checkbox">
                    </div>
                    <div class="kiwi-welcome-simple-terms-content" v-html="termsContent" />
                </div>

                <captcha
                    :network="network"
                />

                <button
                    v-if="!network || network.state === 'disconnected'"
                    :disabled="!readyToStart"
                    class="u-button u-button-primary u-submit kiwi-welcome-simple-start"
                    type="submit"
                    v-html="buttonText"
                />
                <button
                    v-else
                    type="button"
                    class="u-button u-button-primary u-submit kiwi-welcome-simple-start"
                    disabled
                >
                    <i class="fa fa-spin fa-spinner" aria-hidden="true" />
                </button>

                <div v-html="footerText" />
            </form>
        </template>
    </startup-layout>
</template>

<script>

/* global _:true, kiwi:true */

import * as config from '@/config.js';
import * as utils from '@/libs/utils.js';

const Misc = kiwi.require('helpers/Misc');
const Logger = kiwi.require('libs/Logger');
const BouncerProvider = kiwi.require('libs/BouncerProvider');
const Captcha = kiwi.require('components/Captcha');
const StartupLayout = kiwi.require('components/startups/CommonLayout');

const log = Logger.namespace('Welcome.vue');

export default {
    components: {
        Captcha,
        StartupLayout,
    },
    data() {
        return {
            connectErrors: [],
            network: null,
            channel: '',
            nick: '',
            password: '',
            showChannel: true,
            showPass: true,
            toggablePass: true,
            showNick: true,
            show_password_box: false,
            connectWithoutChannel: false,
            showPlainText: false,
            captchaReady: false,
            termsAccepted: false,
            ageInt: null,
            sex: null,
            location: '',
            realname: '',
        };
    },
    computed: {
        age: {
            get() {
                return this.ageInt;
            },
            set(val) {
                if (!val) {
                    this.ageInt = null;
                    return;
                }
                this.ageInt = parseInt(val, 10) || null;
            },
        },
        allowedAge() {
            return config.getSetting('allowedAge');
        },
        sexes() {
            return config.getSetting('sexes');
        },
        showLocation() {
            return config.getSetting('showLocation');
        },
        showRealname() {
            let showRealname = config.getSetting('showRealname');
            let gecosType = config.getSetting('gecosType');
            return showRealname && gecosType === 1;
        },
        requiredFields() {
            return this.$state.getSetting('settings.plugin-asl.requiredFields');
        },
        isAgeValid() {
            if (this.requiredFields.includes('age') && !this.ageInt) {
                return false;
            }
            return (
                !this.ageInt ||
                (this.ageInt >= this.allowedAge.min && this.ageInt <= this.allowedAge.max)
            );
        },
        isSexValid() {
            return !(this.requiredFields.includes('sex') && !this.sex);
        },
        isLocationValid() {
            return !(this.requiredFields.includes('location') && !this.location);
        },
        isRealnameValid() {
            return !(this.requiredFields.includes('realname') && !this.realname);
        },
        aslReady() {
            return (
                this.isAgeValid &&
                this.isSexValid &&
                this.isLocationValid &&
                this.isRealnameValid
            );
        },
        isIframe() {
            return !(window === window.parent || window.opener);
        },
        startupOptions() {
            return this.$state.settings.startupOptions;
        },
        greetingText() {
            let greeting = this.$state.settings.startupOptions.greetingText;
            return typeof greeting === 'string' ?
                greeting :
                this.$t('start_greeting');
        },
        footerText() {
            let footer = this.$state.settings.startupOptions.footerText;
            return typeof footer === 'string' ?
                footer :
                '';
        },
        termsContent() {
            let terms = this.$state.settings.startupOptions.termsContent;
            return typeof terms === 'string' ?
                terms :
                '';
        },
        buttonText() {
            let greeting = this.$state.settings.startupOptions.buttonText;
            return typeof greeting === 'string' ?
                greeting :
                this.$t('start_button');
        },
        isNickValid() {
            let nickPatternStr = this.$state.setting('startupOptions.nick_format');
            let nickPattern = '';
            if (!nickPatternStr) {
                // Nicks cannot start with [0-9- ]
                // ? is not a valid nick character but we allow it as it gets replaced
                // with a number.
                nickPattern = /^[a-z_\\[\]{}^`|][a-z0-9_\-\\[\]{}^`|]*$/i;
            } else {
                // Support custom pattern matches. Eg. only '@example.com' may be allowed
                // on some IRCDs
                let pattern = '';
                let flags = '';
                if (nickPatternStr[0] === '/') {
                    // Custom regex
                    let pos = nickPatternStr.lastIndexOf('/');
                    pattern = nickPatternStr.substring(1, pos);
                    flags = nickPatternStr.substr(pos + 1);
                } else {
                    // Basic contains rule
                    pattern = _.escapeRegExp(nickPatternStr);
                    flags = 'i';
                }

                try {
                    nickPattern = new RegExp(pattern, flags);
                } catch (error) {
                    log.error('Nick format error: ' + error.message);
                    return false;
                }
            }

            return this.nick.match(nickPattern);
        },
        readyToStart() {
            let ready = !!this.nick;

            if (!this.connectWithoutChannel && !this.channel) {
                ready = false;
            }

            // Make sure the channel name starts with a common channel prefix
            if (!this.connectWithoutChannel) {
                let bufferObjs = Misc.extractBuffers(this.channel);
                bufferObjs.forEach((bufferObj) => {
                    if ('#&'.indexOf(bufferObj.name[0]) === -1) {
                        ready = false;
                    }
                });
            }

            // If toggling the password is is disabled, assume it is required
            if (!this.toggablePass && !this.password) {
                ready = false;
            }

            if (!this.isNickValid) {
                ready = false;
            }

            if (this.termsContent && !this.termsAccepted) {
                ready = false;
            }

            if (!this.aslReady) {
                ready = false;
            }

            return ready;
        },
    },
    watch: {
        show_password_box(newVal) {
            if (newVal === false) {
                // clear the password when show password is unchecked
                this.password = '';
            }
        },
    },
    created() {
        let options = this.startupOptions;
        let connectOptions = this.connectOptions();

        // Take some settings from a previous network if available
        let previousNet = null;
        if (connectOptions.hostname.trim()) {
            previousNet = this.$state.getNetworkFromAddress(connectOptions.hostname.trim());
        }

        if (Misc.queryStringVal('nick')) {
            this.nick = Misc.queryStringVal('nick');
        } else if (previousNet && previousNet.connection.nick) {
            this.nick = previousNet.connection.nick;
        } else {
            this.nick = options.nick;
        }
        this.nick = this.processNickRandomNumber(this.nick || '');

        if (options.password) {
            // Don't use previousNet.password if we did not use previousNet.nick
            this.password = options.password;
        } else if (
            previousNet &&
            previousNet.password && (
                !Misc.queryStringVal('nick') || previousNet.connection.nick === Misc.queryStringVal('nick')
            )
        ) {
            this.password = previousNet.password;
            this.show_password_box = true;
        } else {
            this.password = '';
        }

        let parsedGecos = null;
        if (config.getSetting('welcomeUsesLocalStorage') && previousNet && previousNet.gecos) {
            parsedGecos = utils.parseGecos(previousNet.gecos);
        }

        let queryKeys = config.getSetting('queryKeys');
        if (Misc.queryStringVal(queryKeys.age)) {
            this.age = Misc.queryStringVal(queryKeys.age);
        } else if (typeof options.age !== 'undefined') {
            this.age = options.age;
        } else if (parsedGecos && parsedGecos.asl) {
            this.age = parsedGecos.asl.a;
        }

        if (Misc.queryStringVal(queryKeys.sex)) {
            this.sex = Misc.queryStringVal(queryKeys.sex);
        } else if (typeof options.sex !== 'undefined') {
            this.sex = options.sex;
        } else if (parsedGecos && parsedGecos.asl) {
            this.sex = utils.getSexChar(parsedGecos.asl.s);
        }

        if (Misc.queryStringVal(queryKeys.location)) {
            this.location = Misc.queryStringVal(queryKeys.location);
        } else if (typeof options.location !== 'undefined') {
            this.location = options.location;
        } else if (parsedGecos && parsedGecos.asl) {
            this.location = parsedGecos.asl.l;
        }

        if (Misc.queryStringVal(queryKeys.realname)) {
            this.realname = Misc.queryStringVal(queryKeys.realname);
        } else if (typeof options.realname !== 'undefined') {
            this.realname = options.realname;
        } else if (this.showRealname && parsedGecos && parsedGecos.realname) {
            this.realname = parsedGecos.realname;
        }

        this.channel = decodeURIComponent(window.location.hash) || options.channel || '';
        this.showChannel = typeof options.showChannel === 'boolean' ?
            options.showChannel :
            true;
        this.showNick = typeof options.showNick === 'boolean' ?
            options.showNick :
            true;
        this.showPass = typeof options.showPassword === 'boolean' ?
            options.showPassword :
            true;
        this.toggablePass = typeof options.toggablePassword === 'boolean' ?
            options.toggablePassword :
            true;

        this.connectWithoutChannel = !!options.allowNoChannel;

        if (options.bouncer) {
            this.toggablePass = false;
            this.showPass = true;
            this.showChannel = false;
            this.connectWithoutChannel = true;

            let bouncer = new BouncerProvider(this.$state);
            bouncer.enable(
                connectOptions.hostname,
                connectOptions.port,
                connectOptions.tls,
                connectOptions.direct,
                connectOptions.direct_path
            );
        }

        if (options.autoConnect && this.readyToStart) {
            this.startUp();
        }
    },
    methods: {
        buildGecos() {
            if (!this.age && !this.sex && !this.location) {
                return '';
            }
            let gecosId = config.getSetting('gecosType');
            let gecosType = this.$state.pluginASL.gecosTypes[gecosId - 1];
            let gecos = gecosType.build;
            let asl = [this.age || '*', this.sex || '*'];
            if (this.location) {
                asl.push(this.location);
            }

            return gecos.replace('%asl', asl.join(gecosType.separator))
                .replace('%a', this.age || '*')
                .replace('%s', this.sex || '*')
                .replace('%l', this.location || '*')
                .replace('%r', this.realname || '')
                .trim();
        },
        onAltClose(event) {
            if (event.channel) {
                this.channel = event.channel;
            }
            if (event.nick) {
                this.nick = event.nick;
            }
            if (event.password) {
                this.password = event.password;
            }
            if (event.error) {
                this.connectErrors.push(event.error);
            }

            this.$state.settings.startupOptions.altComponent = null;
        },
        readableStateError(err) {
            return Misc.networkErrorMessage(err);
        },
        formSubmit() {
            if (this.readyToStart) {
                this.startUp();
            }
        },
        startUp() {
            this.connectErrors = [];

            let options = Object.assign({}, this.$state.settings.startupOptions);
            let connectOptions = this.connectOptions();
            let netAddress = _.trim(connectOptions.hostname);

            // Check if we have this network already
            let net = this.network || this.$state.getNetworkFromAddress(netAddress);

            let password = this.password;

            // If the network doesn't already exist, add a new one
            net = net || this.$state.addNetwork('Network', this.nick, {
                server: netAddress,
                port: connectOptions.port,
                tls: connectOptions.tls,
                password: password,
                encoding: _.trim(options.encoding),
                direct: connectOptions.direct,
                path: connectOptions.direct_path || '',
                gecos: options.gecos,
                username: options.username,
            });

            // Clear the server buffer in case it already existed and contains messages relating to
            // the previous connection, such as errors. They are now redundant since this is a
            // new connection.
            net.serverBuffer().clearMessages();

            // If we retreived an existing network, update the nick+password with what
            // the user has just put in place
            net.connection.nick = this.nick;
            if (options.bouncer) {
                // Bouncer mode uses server PASS
                net.connection.password = `${this.nick}:${password}`;
                net.password = '';
            } else {
                net.connection.password = '';
                net.password = password;
            }

            let gecos = this.buildGecos();
            if (gecos) {
                net.gecos = gecos;
            }

            if (_.trim(options.encoding || '')) {
                net.connection.encoding = _.trim(options.encoding);
            }

            this.network = net;

            // Only switch to the first channel we join if multiple are being joined
            let hasSwitchedActiveBuffer = false;
            let bufferObjs = Misc.extractBuffers(this.channel);
            bufferObjs.forEach((bufferObj) => {
                let newBuffer = this.$state.addBuffer(net.id, bufferObj.name);
                newBuffer.enabled = true;

                if (newBuffer && !hasSwitchedActiveBuffer) {
                    this.$state.setActiveBuffer(net.id, newBuffer.name);
                    hasSwitchedActiveBuffer = true;
                }

                if (bufferObj.key) {
                    newBuffer.key = bufferObj.key;
                }
            });

            // switch to server buffer if no channels are joined
            if (!options.bouncer && !hasSwitchedActiveBuffer) {
                this.$state.setActiveBuffer(net.id, net.serverBuffer().name);
            }

            net.ircClient.connect();
            let onRegistered = () => {
                if (this.$refs.layout) {
                    this.$refs.layout.close();
                }
                net.ircClient.off('registered', onRegistered);
                net.ircClient.off('close', onClosed);
                net.ircClient.off('irc error', onError);
            };
            let onClosed = () => {
                let lastError = this.network.last_error;
                if (lastError && !this.connectErrors.includes(lastError)) {
                    this.connectErrors.push(lastError);
                }
                net.ircClient.off('registered', onRegistered);
                net.ircClient.off('close', onClosed);
                net.ircClient.off('irc error', onError);
            };
            let onError = (event) => {
                if (!event.reason || this.connectErrors.includes(event.reason)) {
                    return;
                }
                this.connectErrors.push(event.reason);
            };
            net.ircClient.once('registered', onRegistered);
            net.ircClient.once('close', onClosed);
            net.ircClient.on('irc error', onError);
        },
        processNickRandomNumber(nick) {
            // Replace ? with a random number
            let tmp = (nick || '').replace(/\?/g, () => Math.floor(Math.random() * 100).toString());
            return _.trim(tmp);
        },
        handleCaptcha(isReady) {
            this.captchaReady = isReady;
        },
        connectOptions() {
            let options = Object.assign({}, this.$state.settings.startupOptions);
            let connectOptions = Misc.connectionInfoFromConfig(options);

            // If a server isn't specified in the config, set some defaults
            // The webircgateway will have a default network set and will connect
            // there instead. This just removes the requirement of specifying the same
            // irc network address in both the server-side and client side configs
            connectOptions.hostname = connectOptions.hostname || 'default';
            if (!connectOptions.port && connectOptions.direct) {
                connectOptions.port = connectOptions.tls ?
                    443 :
                    80;
            } else if (!connectOptions.port && !connectOptions.direct) {
                connectOptions.port = connectOptions.tls ?
                    6697 :
                    6667;
            }

            return connectOptions;
        },
    },
};
</script>

<style>
/* Containers */
form.kiwi-welcome-simple-form {
    width: 70%;
    padding: 20px;
}

@media (max-width: 1025px) {
    form.kiwi-welcome-simple-form {
        width: 100%;
    }
}

@media (max-width: 850px) {
    form.kiwi-welcome-simple-form {
        background: var(--brand-default-bg);
        border-radius: 5px;
        box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.2);
    }
}

@media (max-width: 600px) {
    form.kiwi-welcome-simple-form {
        max-width: 350px;
    }
}

form.kiwi-welcome-simple-form h2 {
    margin: 0 0 40px 0;
    padding: 0;
    cursor: default;
    font-weight: 600;
    font-size: 2.2em;
    text-align: center;
    line-height: 1.2em;
}

.kiwi-welcome-simple-error {
    text-align: center;
    margin: 1em 0;
    padding: 1em;
}

.kiwi-welcome-simple-error span {
    display: block;
    font-style: italic;
    margin-bottom: 8px;
}

.kiwi-welcome-simple-error span:last-of-type {
    margin-bottom: 0;
}

.kiwi-welcome-simple-input-container {
    width: 100%;
    height: auto;
    position: relative;
    margin: 0 0 20px 0;
}

.kiwi-welcome-simple-input-container:last-of-type {
    margin: 20px 0 40px 0;
}

.kiwi-welcome-simple-terms {
    display: flex;
    flex-direction: row;
}

.kiwi-welcome-simple-terms .kiwi-welcome-simple-terms-content {
    margin-top: 3px;
    line-height: 20px;
}

.kiwi-welcome-simple-form .u-submit {
    width: 100%;
    height: 50px;
    font-size: 1.3em;
}

.kiwi-welcome-simple-start {
    font-size: 1.1em;
    cursor: pointer;
}

.kiwi-welcome-simple-start[disabled] {
    cursor: not-allowed;
    opacity: 0.65;
}

/* ASL additions */

.kiwi-welcome-simple-age-sex {
    position: relative;
    display: flex;
    height: auto;
    margin: 0;
}

.kiwi-welcome-simple-age {
    display: inline-block;
    width: 50%;
}

.kiwi-welcome-simple-age input {
    width: 100%;
}

.kiwi-welcome-simple-sex {
    display: inline-block;
    width: 50%;
    margin-left: 5px;
}

.u-form .kiwi-welcome-simple-sex select {
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    width: 100%;
    padding: 15px 14px;
    overflow: hidden;
    font-size: inherit;
    color: var(--brand-input-fg);
    text-overflow: ellipsis;
    white-space: nowrap;
    appearance: initial;
    border-radius: 5px;
}

.u-form .kiwi-welcome-simple-sex-select::after {
    position: absolute;
    right: 1em;
    padding: 16px 0;
    font-family: fontAwesome, sans-serif;
    line-height: 1em;
    content: '\f078';
}

.u-form .kiwi-welcome-simple-sex select:focus {
    border-color: var(--brand-primary);
    outline: none;
}

.u-form .kiwi-welcome-simple-sex select option {
    background-color: var(--brand-default-bg);
}

.kiwi-input-invalid.u-input-text input.u-input,
.u-form select.kiwi-input-invalid {
    border-color: var(--brand-error);
}

/* End ASL additions */
</style>

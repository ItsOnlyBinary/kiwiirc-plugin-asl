/* global kiwi:true */
/* global _:true */

const basePath = getBasePath();
const configBase = 'plugin-asl';

export const defaultConfig = {
    // Where the web browser can find the locale json files
    localesPath: basePath + 'plugin-asl/locales/{{lng}}.json',

    // Type 1 "[a/s/l?] realname?"
    // Type 2 "a s l?"
    gecosType: 1,

    // If should show location input box on welcome screen
    showLocation: true,

    // If should show realname input box on welcome screen
    showRealname: false,

    // Enable User Browser
    showUserBrowser: true,

    // What icon to use for User Browser
    userBrowserIcon: 'fa-heart',

    // Should the userbrowser show users from all channels
    userBrowserGlobal: false,

    // What colour to use if user did not provide sex
    // 'default' is css default colour
    // '' for random
    fallbackColour: 'default',

    // If should show asl as single line in UserBox
    singleLineUserbox: false,

    // Single line string builder
    // age/sex/location (if they exist) are joined by the separator
    singleLineString: {
        age: '%a years',
        sex: '%s',
        location: '%l',
        separator: ' ',
    },

    // Accepted age range for the Connect button to be enabled
    allowedAge: {
        min: '18',
        max: '99',
    },

    // Age ranges to show on UserBrowser select
    // values can be:
    //   string - treated as all
    //   <50    - less than integer
    //   >50    - greater than integer
    //   25-50  - an inclusive range
    ageRanges: [
        { name: '_all', value: 'all' },
        { name: '< 25', value: '<25' },
        { name: '25 - 45', value: '25-46' },
        { name: '> 45', value: '>45' },
    ],

    // Sex selection and parsing
    // names starting with underscore (_) will be treated as translation strings
    // chars is for matching against gecos (can contain multiple)
    // the first char will be used in gecos creation
    sexes: [
        { name: '_male', chars: 'M', colour: '#2980b9' },
        { name: '_female', chars: 'F', colour: '#a72566' },
        { name: '_other', chars: 'O', colour: '#3aa725' },
    ],

    // Keys used to get asl from query string
    queryKeys: {
        age: 'age',
        sex: 'sex',
        location: 'location',
        realname: 'realname',
    },

    // Fields required for connect button to become active
    // age, sex, location, realname
    requiredFields: [],

    // Restore last ASL from state persistence
    welcomeUsesLocalStorage: true,
};

export function setDefaults(kiwi) {
    kiwi.setConfigDefaults(configBase, defaultConfig);

    // Set internal defaults
    const pluginASL = kiwi.state.pluginASL = Object.create(null);

    const ageRanges = getSetting('ageRanges');
    pluginASL.selectedAgeRange = ageRanges[0].value;

    let sexes = getSetting('sexes');
    if (typeof sexes !== 'object' || !_.isArray(sexes)) {
        // eslint-disable-next-line no-console
        console.error('sexes config option has changed to an array please update your config');
        // eslint-disable-next-line no-console
        console.error('see here: https://github.com/ItsOnlyBinary/kiwiirc-plugin-asl#configuration');
        sexes = defaultConfig.sexes;
    }
    pluginASL.selectedSexes = {};
    let sexesRegex = '';
    for (let i = 0; i < sexes.length; i++) {
        let sex = sexes[i];
        sexesRegex += sex.chars;
        pluginASL.selectedSexes[sex.name] = true;
    }

    pluginASL.gecosTypes = [];
    pluginASL.gecosTypes.push({
        regex: new RegExp('\\[(\\d+|\\*)\\/([' + sexesRegex + '*])(\\/(.*?|\\*))?\\](\\s*(.+))?'),
        build: '[%asl] %r',
        separator: '/',
    });
    pluginASL.gecosTypes.push({
        regex: new RegExp('(\\d+)\\s+([' + sexesRegex + '])(\\s+(.*))?'),
        build: '%asl',
        separator: ' ',
    });
    pluginASL.gecosTypes.push({
        regex: new RegExp('(\\d+|\\*)\\s?\\/\\s?([' + sexesRegex + '*])(\\s?\\/\\s?(.*?|\\*))?'),
        build: '%asl',
        separator: '/',
    });

    pluginASL.userFilter = '';
}

export function setting(name) {
    return kiwi.state.setting([configBase, name].join('.'));
}

export function getSetting(name) {
    return kiwi.state.getSetting(['settings', configBase, name].join('.'));
}

export function setSetting(name, value) {
    return kiwi.state.setSetting(['settings', configBase, name].join('.'), value);
}

function getBasePath() {
    const scripts = document.getElementsByTagName('script');
    const scriptPath = scripts[scripts.length - 1].src;
    return scriptPath.substr(0, scriptPath.lastIndexOf('/') + 1);
}

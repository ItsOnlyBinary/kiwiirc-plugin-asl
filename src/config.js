/* global kiwi:true */

export function setDefaults() {
    // Type 1 "[a/s/l?] realname?"
    // Type 2 "a s l?"
    setSettingDefault('plugin-asl.gecosType', 1);

    // If should show realname input box on welcome screen
    setSettingDefault('plugin-asl.showRealname', false);

    // Enable Userbrowser
    setSettingDefault('plugin-asl.showUserBrowser', true);

    // What icon to use for User Browser
    setSettingDefault('plugin-asl.userBrowserIcon', 'fa-heart');

    // If should show asl as single line in UserBox
    setSettingDefault('plugin-asl.singleLineUserbox', false);

    setSettingDefault('plugin-asl.singleLineString', {
        age: '%a years',
        sex: '%s',
        location: '%l',
        separator: ' ',
    });

    // Age ranges to show on UserBrowser select
    // values can be:
    //   string - treated as all
    //   <50    - less than integer
    //   >50    - greater than integer
    //   25-50  - an inclusive range
    setSettingDefault('plugin-asl.ageRanges', [
        { name: 'All', value: 'all' },
        { name: '< 25', value: '<25' },
        { name: '25 - 45', value: '25-46' },
        { name: '> 45', value: '>45' },
    ]);

    // Sex selection and parsing
    // chars is for matching against gecos (can contain multiple)
    // the first char will be used in gecos
    setSettingDefault('plugin-asl.sexes', {
        Male: { chars: 'M', colour: '#00F' },
        Female: { chars: 'F', colour: '#F0F' },
        Other: { chars: 'O', colour: '#0F0' },
    });

    // Keys used to get asl from query string
    setSettingDefault('plugin-asl.queryKeys', {
        age: 'age',
        sex: 'sex',
        location: 'location',
        realname: 'realname',
    });

    // Strings used through out the plugin
    setSettingDefault('plugin-asl.strings', {
        age: 'Age',
        sex: 'Sex',
        location: 'Location',
        realname: 'Real Name',
        info: 'Info',
        browseUsers: 'Browse Users',
    });

    // Set internal defaults
    kiwi.state.pluginASL = {};

    let ageRanges = kiwi.state.getSetting('settings.plugin-asl.ageRanges');
    kiwi.state.pluginASL.selectedAgeRange = ageRanges[0].value;

    let sexes = kiwi.state.getSetting('settings.plugin-asl.sexes');
    kiwi.state.pluginASL.selectedSexes = {};
    let sexesRegex = '';
    let sexesKeys = Object.keys(sexes);
    for (let i = 0; i < sexesKeys.length; i++) {
        let sex = sexesKeys[i];
        kiwi.state.pluginASL.selectedSexes[sex] = true;
        sexesRegex += sexes[sex].chars;
    }
    kiwi.state.pluginASL.gecosTypes = [];
    kiwi.state.pluginASL.gecosTypes.push({
        regex: new RegExp('\\[(\\d+)\\/([' + sexesRegex + '])(\\/(.*))?\\](\\s*(.+))?'),
        build: '[%asl] %r',
        separator: '/',
    });
    kiwi.state.pluginASL.gecosTypes.push({
        regex: new RegExp('(\\d+)\\s+([' + sexesRegex + '])(\\s+(.*))?'),
        build: '%asl',
        separator: ' ',
    });

    kiwi.state.pluginASL.userFilter = '';
}

function setSettingDefault(name, value) {
    if (kiwi.state.getSetting('settings.' + name) === undefined) {
        kiwi.state.setSetting('settings.' + name, value);
    }
}

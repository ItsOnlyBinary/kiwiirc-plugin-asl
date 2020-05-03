/* global kiwi:true */

export function parseGecos(gecos) {
    let types = kiwi.state.pluginASL.gecosTypes;
    for (let i = 0; i < types.length; i++) {
        let result = gecos.match(types[i].regex);
        if (result) {
            return {
                asl: {
                    a: result[1] === '*' ? null : result[1],
                    s: getSex(result[2]),
                    l: result[4] === '*' ? null : result[4] || null,
                },
                realname: result[6] ? result[6].trim() : '',
            };
        }
    }
    return {
        asl: null,
        realname: gecos,
    };
}

export function getColour(asl) {
    let sex = asl && asl.s ? asl.s : '';
    let sexes = kiwi.state.getSetting('settings.plugin-asl.sexes');
    let fallbackColour = kiwi.state.getSetting('settings.plugin-asl.fallbackColour');
    return sexes[sex] ? sexes[sex].colour : fallbackColour;
}

export function getSexChar(sex) {
    let sexes = kiwi.state.getSetting('settings.plugin-asl.sexes');
    return sexes[sex] ? sexes[sex].chars[0] : null;
}

function getSex(sexChar) {
    let sexes = kiwi.state.getSetting('settings.plugin-asl.sexes');
    let sexesKeys = Object.keys(sexes);
    for (let i = 0; i < sexesKeys.length; i++) {
        let sex = sexesKeys[i];
        if (sexes[sex].chars.indexOf(sexChar) !== -1) {
            return sex;
        }
    }
    return null;
}

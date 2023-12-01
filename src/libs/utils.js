/* global kiwi:true */

export function parseGecos(gecos) {
    const types = kiwi.state.pluginASL.gecosTypes;
    for (let i = 0; i < types.length; i++) {
        const result = gecos.match(types[i].regex);
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
    const aslSex = asl && asl.s ? asl.s : '';
    const sexes = kiwi.state.getSetting('settings.plugin-asl.sexes');
    const fallbackColour = kiwi.state.getSetting('settings.plugin-asl.fallbackColour');
    for (let i = 0; i < sexes.length; i++) {
        const sex = sexes[i];
        if (sex.name === aslSex) {
            return sex.colour;
        }
    }

    return fallbackColour;
}

export function getSexChar(sexName) {
    const sexes = kiwi.state.getSetting('settings.plugin-asl.sexes');
    for (let i = 0; i < sexes.length; i++) {
        const sex = sexes[i];
        if (sex.name === sexName) {
            return sex.chars[0];
        }
    }

    return null;
}

function getSex(sexChar) {
    const sexes = kiwi.state.getSetting('settings.plugin-asl.sexes');
    for (let i = 0; i < sexes.length; i++) {
        const sex = sexes[i];
        if (sex.chars.indexOf(sexChar) !== -1) {
            return sex.name;
        }
    }

    return null;
}

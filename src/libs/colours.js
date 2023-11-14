'kiwi public';

/** @module */

/**
 * Converts a hex CSS color value to RGB.
 * Adapted from http://stackoverflow.com/a/5624139.
 *
 * @param   {String}  hex     The hexadecimal colour value
 * @return  {Object}          The RGBA representation
 */
export function hex2rgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i;
    let fullHex = hex.replace(shorthandRegex, (m, r, g, b, a) => r + r + g + g + b + b + (a ? a + a : ''));

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(fullHex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: result[4] ? parseFloat((parseInt(result[4], 16) / 255).toFixed(3)) : undefined,
    } : null;
}

/**
 * Converts an RGBA color value to a hex string.
 * @param  {Object} rgb RGBA as r, g, b and a [optional] as keys
 * @return {String}     Hex color string
 */
export function rgb2hex(rgb) {
    return '#' + ['r', 'g', 'b', 'a']
        .map((key) => {
            if (key !== 'a') {
                return ('0' + rgb[key].toString(16)).slice(-2);
            }
            if (rgb[key] !== undefined) {
                return ('0' + Math.round(rgb[key] * 255).toString(16)).slice(-2);
            }
            return '';
        })
        .join('');
}

/**
 * Converts an RGB color value to HSL. Conversion formula adapted from
 * http://en.wikipedia.org/wiki/HSL_color_space. This function adapted
 * from http://stackoverflow.com/a/9493060.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {Object}  rgb     RGB as r, g, and b keys
 * @return  {Object}          HSL as h, s, and l keys
 */
export function rgb2hsl(rgb) {
    let r = rgb.r;
    let g = rgb.g;
    let b = rgb.b;

    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) {
            h = (g - b) / d + (g < b ? 6 : 0);
        } else if (max === g) {
            h = (b - r) / d + 2;
        } else if (max === b) {
            h = (r - g) / d + 4;
        }
        h /= 6;
    }

    h = parseFloat((h * 360).toFixed(2));
    s = parseFloat((s * 100).toFixed(2));
    l = parseFloat((l * 100).toFixed(2));

    return { h, s, l };
}

/**
 * Converts an HSL color value to RGB. Conversion formula adapted from
 * http://en.wikipedia.org/wiki/HSL_color_space. This function adapted
 * from http://stackoverflow.com/a/9493060.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {Object}  hsl     HSL as h, s, and l keys
 * @return  {Object}          RGB as r, g, and b values
 */
export function hsl2rgb(hsl) {
    function hue2rgb(_p, _q, _t) {
        let p = _p;
        let q = _q;
        let t = _t;
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    let h = hsl.h;
    let s = hsl.s;
    let l = hsl.l;
    let r = 0;
    let g = 0;
    let b = 0;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

export function hsl2String(hsl) {
    const hasAlpha = (hsl.a !== undefined);
    const prefix = hasAlpha ? 'hsla' : 'hsl';
    const parts = [hsl.h, hsl.s + '%', hsl.l + '%'];
    if (hasAlpha) {
        parts.push(hsl.a);
    }
    return prefix + '(' + parts.join(',') + ')';
}

export function rgb2rgbString(rgb) {
    const hasAlpha = (rgb.a !== undefined);
    const prefix = hasAlpha ? 'rgba' : 'rgb';
    const parts = [rgb.r, rgb.g, rgb.b];
    if (hasAlpha) {
        parts.push(rgb.a);
    }
    return prefix + '(' + parts.join(',') + ')';
}

export function normaliseColour(_str) {
    const str = _str.trim();
    const rgb = {};

    if (str.indexOf('#') === 0) {
        Object.assign(rgb, hex2rgb(str));
    }

    if (str.indexOf('rgb') === 0) {
        const clean = str.replace(/\s+/g, '');
        const match = clean.match(/rgba?\((?<r>[0-9]{1,3}),(?<g>[0-9]{1,3}),(?<b>[0-9]{1,3})(,(?<a>0?\.?\d+))?\)/);

        if (match) {
            Object.entries(match.groups).forEach(([key, value]) => {
                if (typeof value !== 'undefined') {
                    rgb[key] = parseInt(value, 10);
                }
            });
        }
    }

    const isValid = ['r', 'g', 'b'].every((v) => rgb.hasOwnProperty(v) && rgb[v] >= 0 && rgb[v] <= 255);
    if (!isValid) {
        return undefined;
    }
    return rgb;
}

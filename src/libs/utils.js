export function getASL(str) {
	let result = str.match(/\[(\d+|U)\/([MFOU])\/(.*)\]/);
	let sex = {'M': 'Uomo', 'F': 'Donna', 'O': 'Altro'};
	if (result && result.length === 4) {
        let a = result[1] === 'U' ? null : result[1];
        let s = result[2] === 'U' ? null : sex[result[2]];
        let l = result[3] === 'U' ? null : result[3];

		return {a, s, l};
	}
	return {};
}
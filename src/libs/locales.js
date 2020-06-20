/* global kiwi:true */

export default class Locales {
    constructor() {
        this.fallbackLocale = null;
        this.localesPath = '';
        this.nameSpace = '';
        this.testKey = '';
    }

    init(localesPath, nameSpace, testKey) {
        this.localesPath = localesPath;
        this.nameSpace = nameSpace;
        this.testKey = testKey;

        kiwi.i18n.on('languageChanged', (lang) => {
            if (kiwi.i18n.getResource(lang, this.nameSpace, this.testKey)) {
                return;
            }
            this.loadLocale(lang);
        });

        if (kiwi.i18n.language !== 'en-us') {
            // load the fallback language
            this.loadLocale('en-us');
        }

        // load the current language
        this.loadLocale(kiwi.i18n.language);
    }

    loadLocale(_lang) {
        let lang = _lang.toLowerCase();
        let xhttp = new XMLHttpRequest();
        xhttp.onload = (event) => {
            if (xhttp.status !== 200) {
                // Failed to load the locale so apply fallback
                this.applyLocale(lang, null);
                return;
            }
            this.applyLocale(lang, JSON.parse(xhttp.responseText));
        };
        xhttp.open('GET', this.localesPath + '/' + lang + '.json');
        xhttp.send();
    }

    applyLocale(lang, localeData) {
        if (!this.fallbackLocale && lang === 'en-us') {
            this.fallbackLocale = localeData;
        }
        kiwi.i18n.addResourceBundle(lang, this.nameSpace, localeData || this.fallbackLocale);
    }
}

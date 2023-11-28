const pkg = require('../../../package.json');

module.exports = {
    meta: {
        docs: {
            description: 'html class names must start with `u-` or `kiwi-`',
            category: 'base',
            url: null,
        },
        fixable: null,
        schema: [],
    },
    create: (context) => context.parserServices.defineTemplateBodyVisitor({
        'VAttribute[key.name=\'class\']': (node) => {
            const classes = node.value.value.split(' ');
            classes.forEach((c) => {
                // Ignore empty and fontawesome classes
                if (!c || c === 'fa' || c.startsWith('fa-')) {
                    return;
                }
                if (
                    !c.startsWith('kiwi-')
                        && !c.startsWith('u-')
                        // Special exception for google recaptcha -  welcome screen.
                        && !c.startsWith('g-')
                        && !c.startsWith('irc-fg-')
                        && !c.startsWith('irc-bg-')
                        // Exceptions for plugin name
                        && !c.startsWith(pkg.name.replace(/^kiwiirc-/, ''))
                ) {
                    context.report({
                        node,
                        message: 'Expected class name to start with `kiwi-` or `u-` ({{ class }})',
                        data: {
                            class: c,
                        },
                    });
                }
            });
        },
    }),
};

const path = require('path');

module.exports = {
    root: true,

    env: {
        browser: true,
        es6: true,
        node: true,
    },

    parser: 'vue-eslint-parser',

    parserOptions: {
        parser: '@babel/eslint-parser',
        ecmaVersion: 2020,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
    },

    plugins: ['jsdoc'],

    extends: [
        'plugin:vue/vue3-recommended',
        'eslint:recommended',
        '@vue/airbnb',
        'standard',
    ],

    settings: {
        'import/resolver': {
            alias: {
                map: [
                    ['@', path.join(__dirname, 'src')],
                ],
                extensions: ['.js', '.vue', '.json'],
            },
        },
    },

    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

        'class-methods-use-this': 0,
        'comma-dangle': ['error', {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'never',
            exports: 'never',
            functions: 'ignore',
        }],
        'import/extensions': 0,
        'import/no-cycle': 0,
        'import/no-unresolved': [2, {
            ignore: [
                // These files will not exist if lint is run before the first build
                '/res/locales/available\\.json$',
                '/static/locales/\\S+\\.json$',
            ],
        }],
        'import/prefer-default-export': 0,
        'indent': ['error', 4],
        // 'max-len': ['error', { code: 120 }],
        'max-classes-per-file': 0,
        'no-continue': 0,
        'no-else-return': 0,
        'no-multi-assign': 0,
        'no-param-reassign': ['error', { props: false }],
        'no-plusplus': 0,
        'no-prototype-builtins': 0,
        'no-control-regex': 0,
        'object-shorthand': 0,
        'operator-linebreak': 0,
        'prefer-const': 0,
        'prefer-destructuring': 0,
        'prefer-object-spread': 0,
        'prefer-promise-reject-errors': 0,
        'prefer-template': 0,
        'quote-props': ['error', 'consistent-as-needed'],
        'semi': ['error', 'always'],
        'strict': 0,
        'space-before-function-paren': ['error', 'never'],
        'vue/component-definition-name-casing': 0,
        'vue/html-indent': ['error', 4],
        // 'vue/max-len': [
        //     'error',
        //     {
        //         code: 120,
        //         template: 120,
        //         tabWidth: 4,
        //         comments: 120,
        //     },
        // ],
        'vue/max-attributes-per-line': 0,
        'vue/multi-word-component-names': 0,
        'vue/multiline-html-element-content-newline': 0,
        'vue/no-mutating-props': 0,
        'vue/no-unused-components': 0,
        'vue/no-v-html': 0,
        'vue/one-component-per-file': 0,
        'vue/require-default-prop': 0,
        'vue/require-prop-types': 0,
        'vue/singleline-html-element-content-newline': 0,
        'vuejs-accessibility/anchor-has-content': 0,
        'vuejs-accessibility/click-events-have-key-events': 0,
        'vuejs-accessibility/form-control-has-label': 0,
        'vuejs-accessibility/iframe-has-title': 0,
        'vuejs-accessibility/interactive-supports-focus': 0,
        'vuejs-accessibility/label-has-for': 0,
        'vuejs-accessibility/media-has-caption': 0,
        'vuejs-accessibility/mouse-events-have-key-events': 0,

        // TODO vue3
        'multiline-ternary': 0,
        'vue/operator-linebreak': 0,
        'vue/comma-dangle': 0,
        'vue/space-infix-ops': 0,
        'vue/object-curly-newline': 0,
        'vue/object-curly-spacing': 0,
        'vue/key-spacing': 0,
        'vue/no-template-target-blank': 0,
        'vue/no-setup-props-destructure': 0,
        'vue/no-v-for-template-key': 0,
        'vue/quote-props': 0,
        'vue/require-explicit-emits': 0,
        'vue/v-on-event-hyphenation': 0,
    },
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)',
            ],
            env: {
                jest: true,
            },
        },
        {
            files: ['webpack.config.js', 'build/**/*.js'],
            rules: {
                'import/no-extraneous-dependencies': 0,
                'no-console': 0,
            },
        },
    ],
};

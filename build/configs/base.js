const { merge } = require('webpack-merge');

const ESLintPlugin = require('eslint-webpack-plugin');
const ESLintFormatter = require('eslint-formatter-friendly');
const { VueLoaderPlugin } = require('vue-loader');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');

const utils = require('../utils');
const pkg = require('../../package.json');

const cssConfig = require('./css');

module.exports = (env, argv, config) => {
    let sourceMap;
    if (config.mode === 'development') {
        sourceMap = env.WEBPACK_SERVE ? 'eval-source-map' : 'source-map';
    } else if (argv.srcmap) {
        sourceMap = 'source-map';
    }

    const baseConfig = merge(config, {
        context: process.cwd(),

        entry: {
            app: './src/plugin.js',
        },

        devtool: sourceMap,

        output: {
            path: utils.pathResolve('dist'),
            publicPath: 'auto',
            filename: pkg.name.replace(/^kiwiirc-/, '') + '.js',
        },

        resolve: {
            alias: {
                '@': utils.pathResolve('src'),
            },
            extensions: ['.js', '.jsx', '.vue', '.json'],
        },

        externals: {
            vue: 'kiwi.Vue',
        },

        plugins: [
            new ESLintPlugin({
                emitError: true,
                emitWarning: true,
                extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue'],
                formatter: ESLintFormatter,
            }),
            new VueLoaderPlugin(),
            new CaseSensitivePathsPlugin(),
            new CopyPlugin({
                patterns: [
                    {
                        from: utils.pathResolve('res/locales'),
                        to: utils.pathResolve('dist/plugin-asl/locales'),
                        toType: 'dir',
                        globOptions: {
                            ignore: ['.*'],
                        },
                    },
                ],
            }),
            new FriendlyErrorsWebpackPlugin(),
        ],

        module: {
            rules: [
                {
                    test: /\.vue$/,
                    use: [
                        {
                            loader: 'vue-loader',
                            options: {
                                transformAssetUrls: {
                                    // Defaults
                                    video: ['src', 'poster'],
                                    source: 'src',
                                    img: 'src',
                                    image: ['xlink:href', 'href'],
                                    use: ['xlink:href', 'href'],

                                    // Object can be used for svg files
                                    object: 'data',
                                },
                            },
                        },
                    ],
                },

                {
                    test: /\.js$/,
                    // TODO
                    // eslint-disable-next-line arrow-body-style
                    exclude: (file) => {
                        // always transpile js in vue files
                        // if (/\.vue\.jsx?$/.test(file)) {
                        //     return false;
                        // }
                        // Don't transpile node_modules
                        return /node_modules/.test(file);
                    },
                    use: ['babel-loader'],
                },

                // images
                {
                    test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
                    type: 'asset',
                    generator: { filename: 'static/img/[name].[contenthash:8][ext][query]' },
                },

                // svg
                {
                    test: /\.(svg)(\?.*)?$/,
                    type: 'asset/resource',
                    generator: { filename: 'static/img/[name].[contenthash:8][ext][query]' },
                },

                // media
                {
                    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                    type: 'asset',
                    generator: { filename: 'static/media/[name].[contenthash:8][ext][query]' },
                },

                // fonts
                {
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
                    type: 'asset',
                    generator: { filename: 'static/fonts/[name].[contenthash:8][ext][query]' },
                },
            ],
        },
    });

    return cssConfig(env, argv, baseConfig);
};

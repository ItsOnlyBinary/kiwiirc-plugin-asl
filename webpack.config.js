const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const outputFileName = 'plugin-asl.js';

module.exports = (env, argv) => {
    const isDev = env.WEBPACK_SERVE;

    const options = {
        mode: isDev ? 'development' : 'production',
        sourceMap: undefined,
        extraPlugins: []
    };

    if (argv.mode) {
        options.mode = argv.mode;
    }

    if (options.mode === 'development') {
        options.sourceMap = env.WEBPACK_SERVE ? 'eval-source-map' : 'source-map';
    } else if (env.srcmap) {
        options.sourceMap = 'source-map';
    }

    return {
        context: process.cwd(),
        mode: options.mode,
        entry: {
            plugin: './src/plugin.js',
        },
        output: {
            path: path.join(__dirname, 'dist'),
            publicPath: 'auto',
            filename: outputFileName,
            clean: true,
        },
        resolve: {
            alias: {
                '@': path.join(__dirname, 'src'),
            },
            extensions: ['.js', '.jsx', '.vue', '.json'],
        },
        externals: {
            'vue': 'kiwi.Vue',
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    use: ['vue-loader'],
                },
                {
                    test: /\.js$/,
                    use: ['thread-loader', 'babel-loader'],
                },
                {
                    test: /\.css$/,
                    use: styleUse(),
                },
                {
                    test: /\.less$/,
                    use: styleUse('less-loader'),
                },
                {
                    test: /\.s[ac]ss$/,
                    use: styleUse('sass-loader'),
                },
            ]
        },
        plugins: [
            new VueLoaderPlugin(),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, './res/locales'),
                        to: 'plugin-asl/locales/',
                        toType: 'dir',
                        globOptions: {
                            ignore: ['.*']
                        },
                    }
                ],
            }),
            ...options.extraPlugins,
        ],
        devtool: options.sourceMap,
        devServer: {
            static: path.join(__dirname, "dist"),
            compress: true,
            port: 9000,
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        }
    }
};

function styleUse(loader) {
    const use = [
        { loader: 'thread-loader' },
        { loader: 'style-loader' },
        {
            loader: 'css-loader',
            options: {
                importLoaders: 2,
                esModule: false,
            },
        },
        {
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: [
                        autoprefixer,
                        cssnano,
                    ],
                },
            },
        },
    ];

    if (loader) {
        use.push({ loader });
    }

    return use;
}

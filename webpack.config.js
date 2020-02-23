const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const isProd = process.argv.indexOf('--debug') === -1;

module.exports = {
    mode: 'production',
    entry: './src/plugin.js',
    output: {
        filename: 'plugin-asl.js',
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.js$/,
                use: [{loader: 'exports-loader'}, {loader: 'babel-loader'}],
                include: [
                    path.join(__dirname, 'src')
                ]
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.less$/,
                use: [ 'vue-style-loader', 'css-loader', 'less-loader' ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    devtool: isProd ? '' : 'source-map',
    devServer: {
        filename: 'plugin-asl.js',
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 9000
    }
};
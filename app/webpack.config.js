var webpack = require("webpack");
//var CopyWebpackPlugin = require('copy-webpack-plugin');
//var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require('path');


module.exports = {
    entry: "./javascripts/app.js",
    resolve: {
    alias: {
        json: '../build/contracts/'
    }
    },

    output: {
        path: path.resolve(__dirname),
        filename: "bundle.js",
        
    },
    node: {
        fs: "empty"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.html/, loader: "underscore-template-loader" },
//            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
//            { test: /\.hbs/, loader: "handlebars-template-loader" },
//            { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
//            { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
//            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }, 
        ]
    },
    plugins: [

    ]
//    resolve: {
//        alias: {
//            zlib: 'browserify-zlib-next'
//        }
//    }
};

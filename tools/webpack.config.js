module.exports = {
    entry: ['whatwg-fetch', './components/App.jsx'],
    output: {
        path: './public/js',
        filename: 'app.js'
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['react', 'env']
            }
        }]
    }
};

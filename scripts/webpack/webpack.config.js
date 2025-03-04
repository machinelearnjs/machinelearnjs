const path = require('path');

module.exports = {
  entry: './src/lib/index.web.ts',
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      fs: false,
    },
  },
  output: {
    filename: 'machinelearn.min.js',
    path: path.resolve(__dirname, '../../build/lib'),
  },
};

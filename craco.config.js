const WebpackErrorCapturePlugin = require('./webpack-error-capture');
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Replace postcss-loader with our wrapper in development
      if (env === 'development') {
        const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf);
        if (oneOfRule) {
          oneOfRule.oneOf.forEach(rule => {
            if (rule.use && Array.isArray(rule.use)) {
              rule.use.forEach(useItem => {
                if (useItem.loader && useItem.loader.includes('postcss-loader')) {
                  // Replace with our wrapper
                  useItem.loader = path.resolve(__dirname, 'postcss-loader-wrapper.js');
                  console.log('🔧 Replaced postcss-loader with error-capturing wrapper');
                }
              });
            }
          });
        }
      }

      return webpackConfig;
    },
    plugins: {
      add: [
        new WebpackErrorCapturePlugin({
          errorServerUrl: 'http://localhost:4000',
          enabled: process.env.NODE_ENV === 'development'
        })
      ]
    }
  }
};

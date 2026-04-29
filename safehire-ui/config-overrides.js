const { override, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  config => {
    // Enable HMR explicitly
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin()
    );
    
    // Ensure HMR is enabled in dev server
    config.devServer = {
      ...config.devServer,
      hot: true,
      liveReload: true,
    };
    
    return config;
  }
);

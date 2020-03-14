var webpackConfig = require("./webpack.test");

module.exports = function(config) {
  config.set({
    frameworks: ["jasmine"],

    files: [{ pattern: "./karma-test-shim.js", watched: false }],

    preprocessors: {
      "./karma-test-shim.js": ["webpack", "electron", "sourcemap"]
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: "errors-only"
    },

    webpackServer: {
      noInfo: true
    },

    reporters: ["progress"],
    browsers: ["CustomElectron"],
    customLaunchers: {
      CustomElectron: {
        base: "Electron",
        browserWindowOptions: {
          webPreferences: {
            nodeIntegration: true
          }
        }
      }
    },
    client: {
      useIframe: false
    }
  });
};

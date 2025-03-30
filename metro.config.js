const { getDefaultConfig } = require("expo/metro-config");

module.exports = {
  resolver: {
    sourceExts: ["jsx", "js", "ts", "tsx"], // Ensure Metro resolves these extensions
  },
  ...getDefaultConfig(__dirname),
};

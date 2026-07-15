const { withNativeWind } = require('nativewind/metro');
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

config.resolver.assetExts.push('mp4'); 


module.exports = withNativeWind(config, { input: './app/globals.css' });

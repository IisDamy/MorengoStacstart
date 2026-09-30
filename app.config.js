import appJson from './app.json';

export default {
  ...appJson,
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      // googleServicesFile: process.env.GOOGLE_SERVICES_JSON
    },
    ios: {
      ...appJson.expo.ios,
      bundleIdentifier: 'com.yourname.yourapp' // 👈 Add your unique bundle ID here
    }
  }
};

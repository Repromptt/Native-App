const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withFoldableSupport(config) {
  return withAndroidManifest(config, (config) => {
    const mainActivity = config.modResults.manifest.application[0].activity.find(
      (a) => a.$["android:name"] === ".MainActivity"
    );

    if (mainActivity) {
      mainActivity.$["android:resizeableActivity"] = "true";
      mainActivity.$["android:supportsPictureInPicture"] = "true";
      mainActivity.$["android:configChanges"] =
        "screenSize|smallestScreenSize|screenLayout|orientation|keyboardHidden";
    }

    return config;
  });
};

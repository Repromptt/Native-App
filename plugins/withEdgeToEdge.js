// plugins/withEdgeToEdge.js
const { withMainActivity } = require('@expo/config-plugins');

module.exports = function withEdgeToEdge(config) {
  return withMainActivity(config, (config) => {
    if (config.modResults.language === 'java') {
      // Ensure import is present
      if (!config.modResults.contents.includes('import androidx.activity.EdgeToEdge;')) {
        config.modResults.contents = config.modResults.contents.replace(
          /package .*;/,
          (match) => `${match}\nimport androidx.activity.EdgeToEdge;`
        );
      }

      // Insert EdgeToEdge.enable(this) in onCreate
      if (!config.modResults.contents.includes('EdgeToEdge.enable(this);')) {
        config.modResults.contents = config.modResults.contents.replace(
          /super\.onCreate\(savedInstanceState\);\n/,
          `super.onCreate(savedInstanceState);\n    EdgeToEdge.enable(this);\n`
        );
      }
    } else if (config.modResults.language === 'kt') {
      if (!config.modResults.contents.includes('import androidx.activity.EdgeToEdge')) {
        config.modResults.contents = config.modResults.contents.replace(
          /package .*;/,
          (match) => `${match}\nimport androidx.activity.EdgeToEdge`
        );
      }
      if (!config.modResults.contents.includes('EdgeToEdge.enable(this)')) {
        config.modResults.contents = config.modResults.contents.replace(
          /super\.onCreate\(savedInstanceState\)\n/,
          `super.onCreate(savedInstanceState)\n        EdgeToEdge.enable(this)\n`
        );
      }
    }
    return config;
  });
};

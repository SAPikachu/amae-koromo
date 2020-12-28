const { prependWebpackPlugin } = require("@rescripts/utilities");
const { RetryChunkLoadPlugin } = require("webpack-retry-chunk-load-plugin");

module.exports = [
  process.env.NODE_ENV === "production"
    ? (config) =>
        prependWebpackPlugin(
          new RetryChunkLoadPlugin({
            cacheBust: `function() { return Date.now(); }`,
            maxRetries: 5,
            lastResortScript: "window.location.href='?t=' + Date.now();",
          }),
          config
        )
    : (x) => x,
];
// vim: sts=2:sw=2:ts=2:expandtab

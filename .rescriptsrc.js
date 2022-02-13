const { prependWebpackPlugin, getPaths, edit } = require("@rescripts/utilities");
const { RetryChunkLoadPlugin } = require("webpack-retry-chunk-load-plugin");
const isBabelLoader = (inQuestion) => inQuestion && inQuestion.loader && inQuestion.loader.includes("babel-loader");

if (process.env.NODE_ENV === "production") {
  const dayjs = require("dayjs");
  dayjs.extend(require("dayjs/plugin/utc"));
  const timestamp = dayjs.utc().format("YYYYMMDDHHmm");
  process.env.SENTRY_RELEASE = `${timestamp}-${(process.env.COMMIT_REF || "unknown").slice(0, 7)}`;
} else {
  process.env.SENTRY_RELEASE = "devel";
}
process.env.REACT_APP_RELEASE = process.env.SENTRY_RELEASE || process.env.REACT_APP_RELEASE || "";
process.env.REACT_APP_SENTRY_DSN = process.env.SENTRY_DSN || process.env.REACT_APP_SENTRY_DSN || "";

module.exports = [
  process.env.NODE_ENV === "production" && process.env.SENTRY_AUTH_TOKEN
    ? (config) =>
        prependWebpackPlugin(
          new (require("@sentry/webpack-plugin"))({
            validate: true,
            include: "build",
            ignore: ["node_modules", ".rescriptsrc.js"],
            ext: ["js", "jsx", "ts", "tsx", "map", "jsbundle", "bundle"],
            release: process.env.REACT_APP_RELEASE,
            ...(process.env.SENTRY_URL ? { url: process.env.SENTRY_URL } : {}),
            setCommits: {
              auto: true,
              ignoreMissing: true,
            },
          }),
          config
        )
    : (x) => x,
  process.env.RUN_ANALYZER
    ? (config) => prependWebpackPlugin(new (require("webpack-bundle-analyzer").BundleAnalyzerPlugin)(), config)
    : (x) => x,
  process.env.NODE_ENV !== "production"
    ? (config) => {
        const babelLoaderPaths = getPaths(isBabelLoader, config);
        return edit(
          (section) => {
            if (section.test.toString().includes("tsx")) {
              section.options.plugins.unshift([
                "babel-plugin-direct-import",
                { modules: ["@mui/material", "@mui/icons-material", "@mui/lab"] },
              ]);
            }
            return section;
          },
          babelLoaderPaths,
          config
        );
      }
    : (config) => config,
  process.env.NODE_ENV === "production"
    ? (config) =>
        prependWebpackPlugin(
          new RetryChunkLoadPlugin({
            cacheBust: function () {
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.ready
                  .then(function (registration) {
                    return registration.unregister();
                  })
                  .catch(function () {});
              }
              return Date.now();
            }.toString(),
            maxRetries: 5,
            retryDelay: 100,
            lastResortScript: `(${function () {
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.ready
                  .then(function (registration) {
                    return registration.unregister();
                  })
                  .then(function () {
                    window.location.href = "?t=" + Date.now();
                  })
                  .catch(function (error) {
                    console.error(error.message);
                    window.location.href = "?t=" + Date.now();
                  });
              } else {
                window.location.href = "?t=" + Date.now();
              }
            }.toString()})()`,
          }),
          config
        )
    : (x) => x,
];
// vim: sts=2:sw=2:ts=2:expandtab

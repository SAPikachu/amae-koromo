const { editWebpackPlugin } = require("@rescripts/utilities");

module.exports = [
  process.env.NODE_ENV === "production" ? config => editWebpackPlugin(
    p => {
      p.config.importWorkboxFrom = "local";
      return p;
    },
    "GenerateSW",
    config,
  ) : x => x,
];
// vim: sts=2:sw=2:ts=2:expandtab

const { editWebpackPlugin } = require("@rescripts/utilities");

module.exports = [/*
  config => { console.log(config); return config; },
  
  process.env.NODE_ENV === "production"
    ? config =>
        editWebpackPlugin(
          p => {
            p.config.importWorkboxFrom = "local";
            p.config.skipWaiting = true;
            return p;
          },
          "GenerateSW",
          config
        )
    : x => x*/
];
// vim: sts=2:sw=2:ts=2:expandtab

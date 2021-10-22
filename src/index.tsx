const init = () => import(/* webpackMode: "eager" */ "./bootstrap");

if (!Object.values || !window.URLSearchParams || !window.fetch) {
  import(/* webpackMode: "lazy" */ "./utils/polyfill").then(init);
} else {
  init();
}

export {};

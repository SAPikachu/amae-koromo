export function triggerRelayout() {
  requestAnimationFrame(() => window.dispatchEvent(new UIEvent("resize")));
  setTimeout(function() {
    window.dispatchEvent(new UIEvent("resize"));
  }, 200);
}
export function scrollToTop() {
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatPercent = (x: any) => (x > 0 ? `${(x * 100).toFixed(2)}%` : "");

let focusCount = 0;

window.addEventListener("focus", () => {
  focusCount++;
  console.log(`👁️ TAB FOCUS ${focusCount}`, performance.now());
});

const originalFetch = window.fetch;

window.fetch = (...args) => {
  console.log("🌐 FETCH:", args[0]);
  return originalFetch(...args);
};

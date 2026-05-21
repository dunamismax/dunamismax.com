(() => {
  const STORAGE_KEY = "dunamismax-theme";
  const DARK = "dark";
  const LIGHT = "light";

  const currentTheme = () =>
    document.documentElement.dataset.theme === LIGHT ? LIGHT : DARK;

  const applyTheme = (button, theme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    if (!button) return;
    button.setAttribute("aria-pressed", String(theme === DARK));
    button.setAttribute(
      "aria-label",
      `Switch to ${theme === DARK ? "light" : "dark"} mode`,
    );
    button.title = theme === DARK ? "Switch to light mode" : "Switch to dark mode";
  };

  const init = () => {
    const button = document.querySelector("button.theme-toggle");
    applyTheme(button, currentTheme());
    if (!button) return;

    button.addEventListener("click", () => {
      const next = currentTheme() === DARK ? LIGHT : DARK;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (_) {
        /* storage unavailable; toggle is session-only */
      }
      applyTheme(button, next);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

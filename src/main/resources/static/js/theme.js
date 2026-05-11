(() => {
  const STORAGE_KEY = "dunamismax-theme";
  const DARK = "dark";
  const LIGHT = "light";

  const currentTheme = () =>
    document.documentElement.dataset.theme === LIGHT ? LIGHT : DARK;

  const applyTheme = (button, label, theme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    button.setAttribute("aria-pressed", String(theme === DARK));
    button.setAttribute(
      "aria-label",
      `Switch to ${theme === DARK ? "light" : "dark"} mode`,
    );
    if (label) {
      label.textContent = theme === DARK ? "Dark" : "Light";
    }
  };

  const init = () => {
    const button = document.querySelector("button.theme-toggle");
    if (!button) return;
    const label = button.querySelector("[data-theme-target=label]");

    applyTheme(button, label, currentTheme());

    button.addEventListener("click", () => {
      const next = currentTheme() === DARK ? LIGHT : DARK;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (_) {
        /* storage unavailable; toggle is session-only */
      }
      applyTheme(button, label, next);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

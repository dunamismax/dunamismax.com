type Theme = "dark" | "light";

const DARK: Theme = "dark";
const LIGHT: Theme = "light";
const STORAGE_KEY = "dunamismax-theme";

function currentTheme(): Theme {
  const value = document.documentElement.dataset.theme;
  return value === LIGHT ? LIGHT : DARK;
}

function applyTheme(button: HTMLButtonElement, label: HTMLElement | null, theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  button.setAttribute("aria-pressed", String(theme === DARK));
  button.setAttribute(
    "aria-label",
    `Switch to ${theme === DARK ? "light" : "dark"} mode`,
  );
  if (label !== null) {
    label.textContent = theme === DARK ? "Dark" : "Light";
  }
}

export function initThemeToggle(): void {
  const button = document.querySelector<HTMLButtonElement>("button.theme-toggle");
  if (button === null) return;
  const label = button.querySelector<HTMLElement>("[data-theme-target=label]");

  applyTheme(button, label, currentTheme());

  button.addEventListener("click", () => {
    const next: Theme = currentTheme() === DARK ? LIGHT : DARK;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable (private mode, disabled storage) —
      // toggling still applies for the session.
    }
    applyTheme(button, label, next);
  });
}

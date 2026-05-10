import { initThemeToggle } from "./theme.js";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initThemeToggle, { once: true });
} else {
  initThemeToggle();
}

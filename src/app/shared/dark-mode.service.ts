import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  darkMode = signal(true);

  constructor() {
    // Initialize theme from saved preference or default
    const prefersDark =
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.darkMode.set(prefersDark);
    this.applyTheme(prefersDark);
  }

  toggleDarkMode() {
    const newValue = !this.darkMode();
    this.darkMode.set(newValue);
    this.applyTheme(newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean) {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}

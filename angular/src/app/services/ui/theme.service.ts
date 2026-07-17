import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  get darkMode(): boolean {
    return document.body.classList.contains('dark');
  }

  set darkMode(l: boolean) {
    document.body.classList.toggle('dark', l);
    document.documentElement.setAttribute('data-bs-theme', l ? 'dark' : 'light');
    localStorage.setItem('darkMode', String(l));
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
  }
}

import { Injectable, signal } from '@angular/core';

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: string;
  theme: 'dark' | 'light';
  readiness: number;
  readinessFactors: {
    sleep: number;
    hrv: number;
    load: number;
    mood: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readonly profile = signal<UserProfile>({
    id: 'user_alex_1',
    name: 'Alex',
    title: 'Athlete',
    experience: 'Intermediate',
    goal: 'Build Muscle',
    theme: 'dark',
    readiness: 86,
    readinessFactors: {
      sleep: 88,
      hrv: 82,
      load: 78,
      mood: 90
    }
  });

  toggleTheme() {
    this.profile.update(p => {
      const nextTheme = p.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      return { ...p, theme: nextTheme };
    });
  }

  setTheme(theme: 'dark' | 'light') {
    document.documentElement.setAttribute('data-theme', theme);
    this.profile.update(p => ({ ...p, theme }));
  }
}

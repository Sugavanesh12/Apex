import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

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
  private supabase = inject(SupabaseService);

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

  constructor() {
    // If Supabase has an active session user, try loading their profile
    const currentUser = this.supabase.currentUser();
    if (currentUser) {
      this.loadSupabaseProfile(currentUser.id);
    }
  }

  async loadSupabaseProfile(userId: string) {
    try {
      const data = await this.supabase.getProfile(userId);
      if (data) {
        this.profile.update(p => ({
          ...p,
          id: data.id,
          name: data.name || data.display_name || p.name,
          experience: (data.experience as any) || (data.experience_level as any) || p.experience,
          goal: data.goal || p.goal,
          theme: (data.theme as any) || p.theme
        }));
      }
    } catch (err) {
      // Graceful fallback to local profile
      console.warn('Could not fetch Supabase profile:', err);
    }
  }

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


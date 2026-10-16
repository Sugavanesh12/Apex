import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: string;
  weightKg?: number;
  theme: 'dark' | 'light';
  readiness: number;
  readinessFactors: {
    sleep: number;
    hrv: number;
    load: number;
    mood: number;
  };
}

const STORAGE_PROFILE_KEY = 'apex_user_profile_v1';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private supabase = inject(SupabaseService);

  readonly profile = signal<UserProfile>(this.loadStoredProfile());

  constructor() {
    // If Supabase has an active session user, try loading their profile
    const currentUser = this.supabase.currentUser();
    if (currentUser) {
      this.loadSupabaseProfile(currentUser.id);
    }
  }

  private loadStoredProfile(): UserProfile {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading stored user profile:', e);
    }
    return {
      id: 'user_alex_1',
      name: 'Alex',
      title: 'Athlete',
      experience: 'Intermediate',
      goal: 'Build Muscle',
      weightKg: 75,
      theme: 'dark',
      readiness: 86,
      readinessFactors: {
        sleep: 88,
        hrv: 82,
        load: 78,
        mood: 90
      }
    };
  }

  persistProfile() {
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(this.profile()));
    } catch (e) {
      console.warn('Error persisting user profile:', e);
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

  updateProfile(partial: Partial<UserProfile>) {
    this.profile.update(p => ({ ...p, ...partial }));
    this.persistProfile();
  }

  toggleTheme() {
    this.profile.update(p => {
      const nextTheme = p.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      return { ...p, theme: nextTheme };
    });
    this.persistProfile();
  }

  setTheme(theme: 'dark' | 'light') {
    document.documentElement.setAttribute('data-theme', theme);
    this.profile.update(p => ({ ...p, theme }));
    this.persistProfile();
  }
}


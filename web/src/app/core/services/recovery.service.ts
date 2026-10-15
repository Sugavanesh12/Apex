import { Injectable, computed, inject, signal } from '@angular/core';
import { readiness } from '../../domain/readiness';
import { SupabaseService } from './supabase.service';

export type MoodLevel = 'Terrible' | 'Tired' | 'Okay' | 'Good' | 'Great';

export interface CheckinState {
  mood: MoodLevel;
  sleepHours: number;
  sleepQuality: number;
  sorenessLevel: number; // 0 to 10
  energyLevel: number;   // 1 to 10
  stressLevel: number;   // 1 to 10
}

const STORAGE_CHECKIN_KEY = 'apex_user_recovery_checkin_v1';

@Injectable({
  providedIn: 'root'
})
export class RecoveryService {
  private supabase = inject(SupabaseService);

  readonly checkin = signal<CheckinState>(this.loadStoredCheckin());

  readonly sleepTime = computed(() => {
    const h = this.checkin().sleepHours;
    const whole = Math.floor(h);
    const mins = Math.round((h - whole) * 60);
    return `${whole}h ${mins.toString().padStart(2, '0')}m`;
  });

  readonly mood = computed(() => this.checkin().mood);
  readonly hrv = signal('82 ms');
  readonly restingHr = signal('52 bpm');

  readonly readinessResult = computed(() => {
    const c = this.checkin();
    return readiness({
      sleepHours: c.sleepHours,
      sleepQuality: c.sleepQuality,
      soreness: c.sorenessLevel,
      energy: c.energyLevel,
      stress: c.stressLevel,
      loadRatio: 1.05,
      hrvDeltaPct: 8
    });
  });

  constructor() {
    this.hydrateFromSupabase();
  }

  private loadStoredCheckin(): CheckinState {
    try {
      const saved = localStorage.getItem(STORAGE_CHECKIN_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.sleepHours === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading stored recovery checkin:', e);
    }
    return {
      mood: 'Good',
      sleepHours: 7.5,
      sleepQuality: 4,
      sorenessLevel: 2,
      energyLevel: 8,
      stressLevel: 2
    };
  }

  private persistCheckin() {
    try {
      localStorage.setItem(STORAGE_CHECKIN_KEY, JSON.stringify(this.checkin()));
    } catch (e) {
      console.warn('Error saving checkin to storage:', e);
    }
  }

  async hydrateFromSupabase() {
    try {
      const data = await this.supabase.getTodayRecoveryCheckin();
      if (data) {
        const state: CheckinState = {
          mood: (data.mood as MoodLevel) || 'Good',
          sleepHours: Number(data.sleep_hours) || 7.5,
          sleepQuality: Number(data.sleep_quality) || 4,
          sorenessLevel: Number(data.soreness_level) || 2,
          energyLevel: Number(data.energy_level) || 8,
          stressLevel: Number(data.stress_level) || 2
        };
        this.checkin.set(state);
        this.persistCheckin();
      }
    } catch {
      // Graceful offline fallback to localStorage
    }
  }

  updateCheckin(partial: Partial<CheckinState>) {
    this.checkin.update(c => ({ ...c, ...partial }));
    this.persistCheckin();

    const c = this.checkin();
    const result = this.readinessResult();

    // Sync to Supabase in background
    this.supabase.saveRecoveryCheckin({
      mood: c.mood,
      sleepHours: c.sleepHours,
      sleepQuality: c.sleepQuality,
      sorenessLevel: c.sorenessLevel,
      energyLevel: c.energyLevel,
      stressLevel: c.stressLevel,
      readinessScore: result.score,
      readinessReason: result.reason
    }).catch(err => console.warn('Supabase recovery checkin notice:', err));
  }
}

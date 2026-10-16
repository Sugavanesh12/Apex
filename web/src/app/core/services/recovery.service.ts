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
const STORAGE_HISTORY_KEY = 'apex_user_readiness_history_v1';

@Injectable({
  providedIn: 'root'
})
export class RecoveryService {
  private supabase = inject(SupabaseService);

  readonly checkin = signal<CheckinState>(this.loadStoredCheckin());
  readonly pastHistory = signal<number[]>(this.loadStoredHistory());

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

  readonly readinessScore = computed(() => this.readinessResult().score ?? 85);

  /**
   * 14-day readiness trend where the 14th day is reactive to today's live calculated score.
   */
  readonly trendHistory = computed(() => [...this.pastHistory(), this.readinessScore()]);

  readonly trendAvg = computed(() => {
    const arr = this.trendHistory();
    return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 85;
  });

  readonly readinessBadge = computed(() => {
    const s = this.readinessScore();
    if (s >= 80) return { label: 'Optimal Recovery', class: 'badge-primary' };
    if (s >= 65) return { label: 'Moderate Recovery', class: 'badge-cyan' };
    return { label: 'Deload Advised', class: 'badge-coral' };
  });

  readonly recoveryInsight = computed(() => {
    const c = this.checkin();
    const s = this.readinessScore();
    if (c.sleepHours < 7) {
      return `Sleep duration (${c.sleepHours} h) is pulling your recovery down. Prioritize +1 hour tonight to restore autonomic balance.`;
    }
    if (c.stressLevel >= 6) {
      return `Nervous system stress is elevated (${c.stressLevel}/10). Incorporate parasympathetic down-regulation post-workout.`;
    }
    if (c.sorenessLevel >= 6) {
      return `Muscle soreness is elevated (${c.sorenessLevel}/10). Ensure adequate hydration and active soft-tissue mobility.`;
    }
    if (c.energyLevel <= 4) {
      return `Systemic vitality is low (${c.energyLevel}/10). Adjust training volume or take longer rests between compound sets.`;
    }
    return `Autonomic recovery is peak (+${Math.max(4, s - 80)} pts). Sleep consistency and baseline tone prime you for progressive overload.`;
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

  private loadStoredHistory(): number[] {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(-13);
        }
      }
    } catch (e) {
      console.warn('Error reading stored readiness history:', e);
    }
    return [78, 82, 85, 79, 88, 90, 84, 82, 80, 89, 91, 85, 87];
  }

  persistHistory() {
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(this.trendHistory()));
    } catch (e) {
      console.warn('Error saving readiness history:', e);
    }
  }

  updateCheckin(partial: Partial<CheckinState>) {
    this.checkin.update(c => ({ ...c, ...partial }));
    this.persistCheckin();
    this.persistHistory();

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

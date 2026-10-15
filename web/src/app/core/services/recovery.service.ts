import { Injectable, inject, signal } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class RecoveryService {
  private supabase = inject(SupabaseService);

  readonly sleepTime = signal('7h 32m');
  readonly hrv = signal('82 ms');
  readonly restingHr = signal('52 bpm');
  readonly mood = signal<MoodLevel>('Good');

  readonly checkin = signal<CheckinState>({
    mood: 'Good',
    sleepHours: 7.4,
    sleepQuality: 4,
    sorenessLevel: 3,
    energyLevel: 8,
    stressLevel: 2
  });

  readonly readinessResult = signal(
    readiness({
      sleepHours: 7.4,
      sleepQuality: 4,
      soreness: 3,
      energy: 8,
      stress: 2,
      loadRatio: 1.05,
      hrvDeltaPct: 8
    })
  );

  updateCheckin(partial: Partial<CheckinState>) {
    this.checkin.update(c => ({ ...c, ...partial }));
    const c = this.checkin();
    const updated = readiness({
      sleepHours: c.sleepHours,
      sleepQuality: c.sleepQuality,
      soreness: c.sorenessLevel,
      energy: c.energyLevel,
      stress: c.stressLevel,
      loadRatio: 1.05,
      hrvDeltaPct: 8
    });
    this.readinessResult.set(updated);

    // Sync to Supabase in background
    this.supabase.saveRecoveryCheckin({
      mood: c.mood,
      sleepHours: c.sleepHours,
      sleepQuality: c.sleepQuality,
      sorenessLevel: c.sorenessLevel,
      energyLevel: c.energyLevel,
      stressLevel: c.stressLevel,
      readinessScore: updated.score,
      readinessReason: updated.reason
    }).catch(err => console.warn('Supabase recovery checkin notice:', err));
  }
}


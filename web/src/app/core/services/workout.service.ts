import { Injectable, computed, inject, signal } from '@angular/core';
import { detectPr } from '../../domain/training';
import { SupabaseService } from './supabase.service';
import { COMPREHENSIVE_EXERCISE_LIBRARY } from '../data/exercises.data';

export interface ExerciseItem {
  id: string;
  name: string;
  muscle: string;
  secondaryMuscles?: string[];
  category: 'Strength' | 'Hypertrophy' | 'Mobility' | 'Core' | 'HIIT' | 'Full Body' | 'Warmup';
  image: string;
  videoUrl?: string;
  lastPerformance: string;
  targetSetsReps: string;
  prKg: number;
  equipment: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  formCues?: string[];
}

export interface SetEntry {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  isWarmup?: boolean;
  isPr?: boolean;
}

export interface LiveWorkoutState {
  isActive: boolean;
  sessionTitle: string;
  elapsedSeconds: number;
  currentExerciseIndex: number;
  exercises: {
    exercise: ExerciseItem;
    sets: SetEntry[];
    targetReps: number;
    targetSets: number;
  }[];
  restTimerRunning: boolean;
  restSecondsLeft: number;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  readonly exerciseLibrary = signal<ExerciseItem[]>(COMPREHENSIVE_EXERCISE_LIBRARY);

  readonly liveSession = signal<LiveWorkoutState>({
    isActive: false,
    sessionTitle: 'Lower Body Strength',
    elapsedSeconds: 24 * 60 + 17, // 24:17 as in the reference mockup
    currentExerciseIndex: 0,
    exercises: [
      {
        exercise: {
          id: 'back-squat',
          name: 'Back Squat',
          muscle: 'Strength',
          category: 'Strength',
          image: '/img/ex-back-squat.jpg',
          lastPerformance: '120kg × 5',
          targetSetsReps: '4 × 5',
          prKg: 130,
          equipment: 'Barbell',
          description: 'Primary compound movement.'
        },
        targetSets: 4,
        targetReps: 8,
        sets: [
          { setNumber: 1, weightKg: 100, reps: 8, rpe: 7, completed: true, isWarmup: true },
          { setNumber: 2, weightKg: 120, reps: 8, rpe: 8, completed: true, isWarmup: false },
          { setNumber: 3, weightKg: 125, reps: 8, rpe: 8.5, completed: false, isWarmup: false },
          { setNumber: 4, weightKg: 125, reps: 8, rpe: 9, completed: false, isWarmup: false }
        ]
      },
      {
        exercise: {
          id: 'rdl',
          name: 'Romanian Deadlift',
          muscle: 'Strength',
          category: 'Strength',
          image: '/img/ex-rdl.jpg',
          lastPerformance: '80kg × 8',
          targetSetsReps: '3 × 8',
          prKg: 105,
          equipment: 'Barbell',
          description: 'Posterior chain hinge.'
        },
        targetSets: 3,
        targetReps: 8,
        sets: [
          { setNumber: 1, weightKg: 80, reps: 8, rpe: 7, completed: false },
          { setNumber: 2, weightKg: 80, reps: 8, rpe: 7.5, completed: false },
          { setNumber: 3, weightKg: 85, reps: 8, rpe: 8, completed: false }
        ]
      }
    ],
    restTimerRunning: false,
    restSecondsLeft: 45
  });

  private timerInterval?: any;
  private restInterval?: any;
  private supabase = inject(SupabaseService);

  constructor() {
    this.hydrateFromSupabase();
  }

  async hydrateFromSupabase() {
    try {
      const rows = await this.supabase.getExercises();
      if (rows && rows.length > 0) {
        const mapped: ExerciseItem[] = rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          muscle: r.muscle,
          category: r.category as any,
          image: r.image,
          equipment: r.equipment,
          description: r.description || '',
          targetSetsReps: r.target_sets_reps || '3 × 10',
          lastPerformance: 'Previous session',
          prKg: 120
        }));
        this.exerciseLibrary.set(mapped);
      }
    } catch {
      // Graceful fallback to rich mock data
    }
  }

  readonly currentExercise = computed(() => {
    const s = this.liveSession();
    return s.exercises[s.currentExerciseIndex] || s.exercises[0];
  });

  startLiveSession() {
    this.liveSession.update(s => ({
      ...s,
      isActive: true,
      elapsedSeconds: 0
    }));

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.liveSession.update(s => ({ ...s, elapsedSeconds: s.elapsedSeconds + 1 }));
    }, 1000);
  }

  completeCurrentSet(setIndex: number) {
    this.liveSession.update(s => {
      const exIdx = s.currentExerciseIndex;
      const ex = s.exercises[exIdx];
      if (!ex || !ex.sets[setIndex]) return s;

      const currentSet = ex.sets[setIndex];
      const prCheck = detectPr(
        { weightKg: currentSet.weightKg, reps: currentSet.reps },
        [{ weightKg: ex.exercise.prKg, reps: 5 }]
      );

      const updatedSets = [...ex.sets];
      updatedSets[setIndex] = {
        ...currentSet,
        completed: true,
        isPr: prCheck.isPr
      };

      const updatedExercises = [...s.exercises];
      updatedExercises[exIdx] = { ...ex, sets: updatedSets };

      return {
        ...s,
        exercises: updatedExercises,
        restTimerRunning: true,
        restSecondsLeft: 45
      };
    });

    this.startRestTimer();
  }

  updateSetReps(setIndex: number, delta: number) {
    this.liveSession.update(s => {
      const exIdx = s.currentExerciseIndex;
      const ex = s.exercises[exIdx];
      const set = ex.sets[setIndex];
      if (!set) return s;
      const newReps = Math.max(1, set.reps + delta);
      const updatedSets = [...ex.sets];
      updatedSets[setIndex] = { ...set, reps: newReps };
      const updatedExercises = [...s.exercises];
      updatedExercises[exIdx] = { ...ex, sets: updatedSets };
      return { ...s, exercises: updatedExercises };
    });
  }

  updateSetWeight(setIndex: number, delta: number) {
    this.liveSession.update(s => {
      const exIdx = s.currentExerciseIndex;
      const ex = s.exercises[exIdx];
      const set = ex.sets[setIndex];
      if (!set) return s;
      const newWeight = Math.max(0, set.weightKg + delta);
      const updatedSets = [...ex.sets];
      updatedSets[setIndex] = { ...set, weightKg: newWeight };
      const updatedExercises = [...s.exercises];
      updatedExercises[exIdx] = { ...ex, sets: updatedSets };
      return { ...s, exercises: updatedExercises };
    });
  }

  startRestTimer() {
    if (this.restInterval) clearInterval(this.restInterval);
    this.restInterval = setInterval(() => {
      this.liveSession.update(s => {
        if (s.restSecondsLeft <= 1) {
          clearInterval(this.restInterval);
          return { ...s, restTimerRunning: false, restSecondsLeft: 0 };
        }
        return { ...s, restSecondsLeft: s.restSecondsLeft - 1 };
      });
    }, 1000);
  }

  finishSession() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.restInterval) clearInterval(this.restInterval);
    const session = this.liveSession();
    this.liveSession.update(s => ({ ...s, isActive: false }));

    // Sync to Supabase in background
    const allSets: Array<{ exerciseId: string; setNumber: number; weightKg: number; reps: number; rpe?: number; isPr?: boolean }> = [];
    session.exercises.forEach(e => {
      e.sets.filter(s => s.completed).forEach(s => {
        allSets.push({
          exerciseId: e.exercise.id,
          setNumber: s.setNumber,
          weightKg: s.weightKg,
          reps: s.reps,
          rpe: s.rpe,
          isPr: s.isPr
        });
      });
    });

    if (allSets.length > 0) {
      this.supabase.saveWorkoutSession({
        title: session.sessionTitle,
        durationSeconds: session.elapsedSeconds,
        sets: allSets
      }).catch(err => console.warn('Supabase session sync notice:', err));
    }
  }
}

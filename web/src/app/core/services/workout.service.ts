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
  kinematicType?: 'squat' | 'hinge' | 'bench' | 'overhead' | 'pullup' | 'row' | 'curl' | 'triceps' | 'lunge' | 'core' | 'mobility';
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

export interface LoggedSetEntry {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  isWarmup?: boolean;
  isPr?: boolean;
}

export interface LoggedExerciseItem {
  exerciseId: string;
  exerciseName: string;
  muscle: string;
  category: string;
  image?: string;
  sets: LoggedSetEntry[];
}

export interface CompletedSessionItem {
  id: string;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  completedAt: string;
  durationMinutes: number;
  totalVolumeKg: number;
  totalSets: number;
  exercisesCount: number;
  exercises?: LoggedExerciseItem[];
  notes?: string;
}

const STORAGE_SESSIONS_KEY = 'apex_user_workout_history_v2';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  readonly exerciseLibrary = signal<ExerciseItem[]>(COMPREHENSIVE_EXERCISE_LIBRARY);
  readonly completedSessions = signal<CompletedSessionItem[]>(this.loadStoredSessions());

  getTodayDateStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Real-time completed sessions for today (resets every single day, keeping history safe)
  readonly todaySessions = computed(() => {
    const today = this.getTodayDateStr();
    return this.completedSessions().filter(s => s.date === today);
  });

  readonly isTodayCompleted = computed(() => {
    return this.todaySessions().length > 0;
  });

  readonly liveSession = signal<LiveWorkoutState>({
    isActive: false,
    sessionTitle: 'Lower Body Strength',
    elapsedSeconds: 0,
    currentExerciseIndex: 0,
    exercises: [
      {
        exercise: {
          id: 'back-squat',
          name: 'Barbell Back Squat',
          muscle: 'Quads',
          secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
          category: 'Strength',
          image: '/img/ex-back-squat.jpg',
          videoUrl: '/video/squat.mp4',
          lastPerformance: '120kg × 5',
          targetSetsReps: '4 × 5',
          prKg: 135,
          equipment: 'Barbell & Rack',
          difficulty: 'Intermediate',
          kinematicType: 'squat',
          description: 'Primary compound movement for total leg mass and spinal bracing.',
          formCues: [
            'Set bar on mid-traps, pull elbows down to create upper back shelf',
            'Brace core 360 degrees before descent',
            'Break at hips and knees simultaneously to parallel',
            'Drive powerfully through mid-foot'
          ]
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
          name: 'Romanian Deadlift (RDL)',
          muscle: 'Hamstrings',
          secondaryMuscles: ['Glutes', 'Erectors', 'Lats'],
          category: 'Strength',
          image: '/img/ex-rdl.jpg',
          videoUrl: '/video/rdl.mp4',
          lastPerformance: '95kg × 8',
          targetSetsReps: '3 × 8',
          prKg: 115,
          equipment: 'Barbell',
          difficulty: 'Intermediate',
          kinematicType: 'hinge',
          description: 'Posterior chain hinge stretching hamstrings under control.',
          formCues: [
            'Push hips straight backward toward the wall behind you',
            'Keep barbell skimming down thighs and shins',
            'Drive hips forward to stand tall and squeeze glutes'
          ]
        },
        targetSets: 3,
        targetReps: 8,
        sets: [
          { setNumber: 1, weightKg: 80, reps: 8, rpe: 7, completed: false },
          { setNumber: 2, weightKg: 80, reps: 8, rpe: 7.5, completed: false },
          { setNumber: 3, weightKg: 85, reps: 8, rpe: 8, completed: false }
        ]
      },
      {
        exercise: {
          id: 'split-squat',
          name: 'Bulgarian Split Squat',
          muscle: 'Quads & Glutes',
          secondaryMuscles: ['Adductors', 'Calves'],
          category: 'Hypertrophy',
          image: '/img/ex-split-squat.jpg',
          lastPerformance: '22kg × 10',
          targetSetsReps: '3 × 10',
          prKg: 28,
          equipment: 'Dumbbells & Bench',
          difficulty: 'Intermediate',
          kinematicType: 'lunge',
          description: 'Unilateral quad and glute hypertrophy builder with deep stretch.',
          formCues: [
            'Elevate rear foot on bench laces-down',
            'Slight forward torso lean to load the working front hip',
            'Descend until front thigh is parallel to ground'
          ]
        },
        targetSets: 3,
        targetReps: 10,
        sets: [
          { setNumber: 1, weightKg: 20, reps: 10, rpe: 7, completed: false },
          { setNumber: 2, weightKg: 22, reps: 10, rpe: 8, completed: false },
          { setNumber: 3, weightKg: 22, reps: 10, rpe: 8.5, completed: false }
        ]
      },
      {
        exercise: {
          id: 'calf-raise',
          name: 'Standing Calf Raise',
          muscle: 'Calves',
          secondaryMuscles: ['Achilles tendon'],
          category: 'Hypertrophy',
          image: '/img/ex-calf-raise.jpg',
          lastPerformance: '80kg × 15',
          targetSetsReps: '3 × 15',
          prKg: 95,
          equipment: 'Machine / Barbell',
          difficulty: 'Beginner',
          description: 'Gastrocnemius isolation with full eccentric stretch and peak contraction.',
          formCues: [
            'Drop heels below step for deep stretch at the bottom',
            'Pause 1 full second at full stretch',
            'Drive up forcefully onto balls of feet and hold peak contraction'
          ]
        },
        targetSets: 3,
        targetReps: 15,
        sets: [
          { setNumber: 1, weightKg: 70, reps: 15, rpe: 7, completed: false },
          { setNumber: 2, weightKg: 75, reps: 15, rpe: 8, completed: false },
          { setNumber: 3, weightKg: 80, reps: 12, rpe: 9, completed: false }
        ]
      }
    ],
    restTimerRunning: false,
    restSecondsLeft: 0
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

  addExerciseToLiveSession(exercise: ExerciseItem) {
    this.liveSession.update(s => {
      const exists = s.exercises.some(
        e => e.exercise.id === exercise.id || e.exercise.name.toLowerCase() === exercise.name.toLowerCase()
      );
      if (exists) return s;

      const defaultSets: SetEntry[] = [
        { setNumber: 1, weightKg: exercise.prKg ? Math.round(exercise.prKg * 0.7) : 50, reps: 10, rpe: 7, completed: false },
        { setNumber: 2, weightKg: exercise.prKg ? Math.round(exercise.prKg * 0.8) : 60, reps: 10, rpe: 8, completed: false },
        { setNumber: 3, weightKg: exercise.prKg ? Math.round(exercise.prKg * 0.85) : 65, reps: 8, rpe: 8.5, completed: false }
      ];

      return {
        ...s,
        exercises: [
          ...s.exercises,
          {
            exercise,
            targetSets: defaultSets.length,
            targetReps: 10,
            sets: defaultSets
          }
        ]
      };
    });
  }

  startLiveSession() {
    this.liveSession.update(s => ({
      ...s,
      isActive: true,
      elapsedSeconds: 0,
      restTimerRunning: false,
      restSecondsLeft: 0
    }));
  }

  setExerciseIndex(index: number) {
    this.liveSession.update(s => ({
      ...s,
      currentExerciseIndex: Math.max(0, Math.min(s.exercises.length - 1, index))
    }));
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
        restTimerRunning: false,
        restSecondsLeft: 0
      };
    });
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

  private loadStoredSessions(): CompletedSessionItem[] {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const getDateOffset = (daysAgo: number): { dateStr: string; label: string } => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      return { dateStr, label };
    };

    const d1 = getDateOffset(1); // Yesterday
    const d3 = getDateOffset(3); // 3 days ago
    const d5 = getDateOffset(5); // 5 days ago
    const d7 = getDateOffset(7); // 7 days ago
    const d10 = getDateOffset(10); // 10 days ago
    const d12 = getDateOffset(12); // 12 days ago
    const d15 = getDateOffset(15); // 15 days ago

    // Baseline historical workouts (yesterday and prior days have full logs; today resets clean and fresh)
    const baseline: CompletedSessionItem[] = [
      {
        id: 'sess-y1',
        title: 'Lower Body Strength & Hypertrophy',
        date: d1.dateStr,
        completedAt: `${d1.label} · 09:30 AM`,
        durationMinutes: 48,
        totalVolumeKg: 3680,
        totalSets: 7,
        exercisesCount: 2,
        exercises: [
          {
            exerciseId: 'back-squat',
            exerciseName: 'Barbell Back Squat',
            muscle: 'Quads',
            category: 'Strength',
            image: '/img/ex-back-squat.jpg',
            sets: [
              { setNumber: 1, weightKg: 100, reps: 8, rpe: 7, completed: true, isWarmup: true },
              { setNumber: 2, weightKg: 120, reps: 8, rpe: 8, completed: true, isWarmup: false },
              { setNumber: 3, weightKg: 125, reps: 8, rpe: 8.5, completed: true, isWarmup: false },
              { setNumber: 4, weightKg: 130, reps: 6, rpe: 9, completed: true, isPr: true }
            ]
          },
          {
            exerciseId: 'rdl',
            exerciseName: 'Romanian Deadlift (RDL)',
            muscle: 'Hamstrings',
            category: 'Strength',
            image: '/img/ex-rdl.jpg',
            sets: [
              { setNumber: 1, weightKg: 85, reps: 8, rpe: 7.5, completed: true },
              { setNumber: 2, weightKg: 90, reps: 8, rpe: 8, completed: true },
              { setNumber: 3, weightKg: 95, reps: 8, rpe: 8.5, completed: true }
            ]
          }
        ],
        notes: 'Explosive drive out of the bottom of the squat. Bar speed was crisp on all sets.'
      },
      {
        id: 'sess-d3',
        title: 'Upper Body Push Power',
        date: d3.dateStr,
        completedAt: `${d3.label} · 10:15 AM`,
        durationMinutes: 44,
        totalVolumeKg: 3120,
        totalSets: 6,
        exercisesCount: 2,
        exercises: [
          {
            exerciseId: 'bench-press',
            exerciseName: 'Barbell Bench Press',
            muscle: 'Chest',
            category: 'Strength',
            image: '/img/ex-bench-press.jpg',
            sets: [
              { setNumber: 1, weightKg: 80, reps: 10, rpe: 7, completed: true },
              { setNumber: 2, weightKg: 90, reps: 8, rpe: 8, completed: true },
              { setNumber: 3, weightKg: 95, reps: 6, rpe: 9, completed: true }
            ]
          },
          {
            exerciseId: 'overhead-press',
            exerciseName: 'Standing Overhead Press',
            muscle: 'Shoulders',
            category: 'Strength',
            image: '/img/ex-overhead-press.jpg',
            sets: [
              { setNumber: 1, weightKg: 50, reps: 8, rpe: 7.5, completed: true },
              { setNumber: 2, weightKg: 55, reps: 8, rpe: 8.5, completed: true },
              { setNumber: 3, weightKg: 55, reps: 7, rpe: 9, completed: true }
            ]
          }
        ],
        notes: 'Strict vertical bar path. Upper pec engagement was optimal.'
      },
      {
        id: 'sess-d5',
        title: 'Back & Posterior Pull Density',
        date: d5.dateStr,
        completedAt: `${d5.label} · 08:45 AM`,
        durationMinutes: 50,
        totalVolumeKg: 3450,
        totalSets: 7,
        exercisesCount: 2,
        exercises: [
          {
            exerciseId: 'barbell-row',
            exerciseName: 'Barbell Bent-Over Row',
            muscle: 'Back',
            category: 'Strength',
            image: '/img/ex-barbell-row.jpg',
            sets: [
              { setNumber: 1, weightKg: 75, reps: 10, rpe: 7, completed: true },
              { setNumber: 2, weightKg: 85, reps: 8, rpe: 8, completed: true },
              { setNumber: 3, weightKg: 90, reps: 8, rpe: 8.5, completed: true },
              { setNumber: 4, weightKg: 90, reps: 7, rpe: 9, completed: true }
            ]
          },
          {
            exerciseId: 'bicep-curl',
            exerciseName: 'Standing Barbell Bicep Curl',
            muscle: 'Biceps',
            category: 'Hypertrophy',
            image: '/img/ex-bicep-curl.jpg',
            sets: [
              { setNumber: 1, weightKg: 35, reps: 10, rpe: 7.5, completed: true },
              { setNumber: 2, weightKg: 40, reps: 8, rpe: 8.5, completed: true },
              { setNumber: 3, weightKg: 40, reps: 8, rpe: 9, completed: true }
            ]
          }
        ]
      },
      {
        id: 'sess-d7',
        title: 'Lower Body Posterior & Core',
        date: d7.dateStr,
        completedAt: `${d7.label} · 07:30 AM`,
        durationMinutes: 42,
        totalVolumeKg: 2980,
        totalSets: 6,
        exercisesCount: 2,
        exercises: [
          {
            exerciseId: 'deadlift',
            exerciseName: 'Conventional Barbell Deadlift',
            muscle: 'Back & Glutes',
            category: 'Strength',
            image: '/img/ex-deadlift.jpg',
            sets: [
              { setNumber: 1, weightKg: 120, reps: 6, rpe: 7, completed: true },
              { setNumber: 2, weightKg: 140, reps: 5, rpe: 8, completed: true },
              { setNumber: 3, weightKg: 150, reps: 4, rpe: 9, completed: true }
            ]
          },
          {
            exerciseId: 'walking-lunge',
            exerciseName: 'Dumbbell Walking Lunge',
            muscle: 'Quads & Glutes',
            category: 'Hypertrophy',
            image: '/img/ex-lunge.jpg',
            sets: [
              { setNumber: 1, weightKg: 24, reps: 12, rpe: 7.5, completed: true },
              { setNumber: 2, weightKg: 24, reps: 12, rpe: 8, completed: true },
              { setNumber: 3, weightKg: 24, reps: 12, rpe: 8.5, completed: true }
            ]
          }
        ]
      },
      {
        id: 'sess-d10',
        title: 'Upper Hypertrophy & Shoulders',
        date: d10.dateStr,
        completedAt: `${d10.label} · 09:00 AM`,
        durationMinutes: 45,
        totalVolumeKg: 2850,
        totalSets: 6,
        exercisesCount: 2
      },
      {
        id: 'sess-d12',
        title: 'Heavy Squat & Leg Foundations',
        date: d12.dateStr,
        completedAt: `${d12.label} · 08:30 AM`,
        durationMinutes: 46,
        totalVolumeKg: 2750,
        totalSets: 6,
        exercisesCount: 2
      },
      {
        id: 'sess-d15',
        title: 'Full Body Functional Benchmark',
        date: d15.dateStr,
        completedAt: `${d15.label} · 11:00 AM`,
        durationMinutes: 52,
        totalVolumeKg: 3100,
        totalSets: 7,
        exercisesCount: 2
      }
    ];

    try {
      const saved = localStorage.getItem(STORAGE_SESSIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out any legacy pre-seeded mock sessions on today's date so today is always fresh
          const filtered = parsed.filter(s => !(s.id === 'sess-today' && s.date === todayStr));
          return filtered;
        }
      }
    } catch (e) {
      console.warn('Error reading stored workout sessions:', e);
    }

    return baseline;
  }

  private persistSessions() {
    try {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(this.completedSessions()));
    } catch (e) {
      console.warn('Error saving workout sessions to storage:', e);
    }
  }

  finishSession(): CompletedSessionItem {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.restInterval) clearInterval(this.restInterval);
    const session = this.liveSession();
    this.liveSession.update(s => ({ ...s, isActive: false }));

    const loggedExercises: LoggedExerciseItem[] = [];
    let totalCompletedSets = 0;
    let totalVolume = 0;

    session.exercises.forEach(e => {
      const completedSets = e.sets.filter(s => s.completed);
      const setsToLog = completedSets.length > 0 ? completedSets : e.sets;
      loggedExercises.push({
        exerciseId: e.exercise.id,
        exerciseName: e.exercise.name,
        muscle: e.exercise.muscle,
        category: e.exercise.category,
        image: e.exercise.image,
        sets: setsToLog.map(s => ({ ...s, completed: true }))
      });
      totalCompletedSets += setsToLog.length;
      totalVolume += setsToLog.reduce((acc, s) => acc + (s.weightKg * s.reps), 0);
    });

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const record: CompletedSessionItem = {
      id: `sess-${Date.now()}`,
      title: session.sessionTitle || 'Lower Body Strength',
      date: dateStr,
      completedAt: now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: 45,
      totalVolumeKg: totalVolume || 3420,
      totalSets: totalCompletedSets || 4,
      exercisesCount: loggedExercises.length,
      exercises: loggedExercises
    };

    this.completedSessions.update(list => [record, ...list]);
    this.persistSessions();

    // Background sync to Supabase if configured
    const allSets = loggedExercises.flatMap(e => e.sets.map(s => ({
      exerciseId: e.exerciseId,
      setNumber: s.setNumber,
      weightKg: s.weightKg,
      reps: s.reps,
      rpe: s.rpe,
      isPr: s.isPr
    })));

    if (allSets.length > 0) {
      this.supabase.saveWorkoutSession({
        title: record.title,
        durationSeconds: 45 * 60,
        sets: allSets
      }).catch(err => console.warn('Supabase session sync notice:', err));
    }

    return record;
  }

  logManualSession(session: {
    title: string;
    date: string; // YYYY-MM-DD
    exercises: LoggedExerciseItem[];
    notes?: string;
  }): CompletedSessionItem {
    let totalSets = 0;
    let totalVolume = 0;

    session.exercises.forEach(e => {
      totalSets += e.sets.length;
      totalVolume += e.sets.reduce((sum, s) => sum + (s.weightKg * s.reps), 0);
    });

    const d = new Date(session.date + 'T12:00:00');
    const record: CompletedSessionItem = {
      id: `sess-manual-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: session.title,
      date: session.date,
      completedAt: d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' · Logged',
      durationMinutes: 45,
      totalVolumeKg: totalVolume,
      totalSets,
      exercisesCount: session.exercises.length,
      exercises: session.exercises,
      notes: session.notes
    };

    this.completedSessions.update(list => [record, ...list]);
    this.persistSessions();
    return record;
  }

  deleteSession(sessionId: string) {
    this.completedSessions.update(list => list.filter(s => s.id !== sessionId));
    this.persistSessions();
  }

  getSessionsForDate(dateStr: string): CompletedSessionItem[] {
    return this.completedSessions().filter(s => s.date === dateStr);
  }

  computeTrajectory(timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    const sessions = this.completedSessions();
    const totalVolume = sessions.reduce((acc, s) => acc + s.totalVolumeKg, 0);
    const totalSets = sessions.reduce((acc, s) => acc + s.totalSets, 0);

    const recent = sessions.slice(0, Math.max(1, Math.ceil(sessions.length / 2)));
    const prior = sessions.slice(Math.ceil(sessions.length / 2));

    const recentVol = recent.reduce((acc, s) => acc + s.totalVolumeKg, 0);
    const priorVol = prior.reduce((acc, s) => acc + s.totalVolumeKg, 0);

    const deltaKg = recentVol - priorVol;
    const pctChange = priorVol > 0 ? Math.round(((recentVol - priorVol) / priorVol) * 100) : 14;

    const isImproving = pctChange >= 3;
    const isMaintaining = Math.abs(pctChange) < 3;

    return {
      timeframe,
      totalVolume,
      totalSets,
      recentVolume: recentVol,
      priorVolume: priorVol,
      pctChange: pctChange > 0 ? `+${pctChange}%` : `${pctChange}%`,
      deltaKg,
      status: isImproving ? 'Improving' : (isMaintaining ? 'Maintaining' : 'Deproving (Deload)'),
      statusClass: isImproving ? 'stat-improving' : (isMaintaining ? 'stat-maintaining' : 'stat-deproving'),
      headline: isImproving
        ? 'Progressive Overload Active (Improving)'
        : (isMaintaining ? 'Strength & Volume Maintained' : 'Volume Reduction (Deproving / Deload)'),
      description: isImproving
        ? `Training volume increased by ${Math.abs(deltaKg).toLocaleString()} kg (+${pctChange}%) across your recent workouts. Neuromuscular recruitment, mechanical tension, and strength progression are trending upward.`
        : (isMaintaining
          ? 'Training load is consistent with steady baseline strength. Solid foundation for progressive resistance increase in your next microcycle.'
          : `Training volume decreased by ${Math.abs(deltaKg).toLocaleString()} kg (${pctChange}%) compared to prior sessions. If intentional, this facilitates systemic CNS and connective tissue recovery. Otherwise, add 1-2 working sets per muscle group.`)
    };
  }

  getVolumeHistory(timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'): { label: string; volumeKg: number; sets: number; date?: string; isPeak?: boolean }[] {
    const sessions = this.completedSessions();
    const now = new Date();

    if (timeframe === 'daily') {
      const days: { label: string; volumeKg: number; sets: number; date: string; isPeak?: boolean }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString([], { weekday: 'short' });
        const matching = sessions.filter(s => s.date === dateStr);
        const vol = matching.reduce((sum, s) => sum + s.totalVolumeKg, 0);
        const sets = matching.reduce((sum, s) => sum + s.totalSets, 0);
        days.push({ label: dayLabel, volumeKg: vol, sets, date: dateStr });
      }
      const maxVol = Math.max(...days.map(d => d.volumeKg));
      if (maxVol > 0) {
        days.forEach(d => { if (d.volumeKg === maxVol) d.isPeak = true; });
      }
      return days;
    } else if (timeframe === 'weekly') {
      const weeks: { label: string; volumeKg: number; sets: number; isPeak?: boolean }[] = [];
      const labels = ['Wk -3', 'Wk -2', 'Last Wk', 'This Wk'];

      for (let i = 3; i >= 0; i--) {
        const endDaysAgo = i * 7;
        const startDaysAgo = (i + 1) * 7;
        const dStart = new Date(now.getTime() - startDaysAgo * 86400000).toISOString().split('T')[0];
        const dEnd = new Date(now.getTime() - endDaysAgo * 86400000).toISOString().split('T')[0];

        const matching = sessions.filter(s => s.date >= dStart && s.date <= dEnd);
        const vol = matching.reduce((sum, s) => sum + s.totalVolumeKg, 0);
        const sets = matching.reduce((sum, s) => sum + s.totalSets, 0);
        weeks.push({ label: labels[3 - i], volumeKg: vol, sets, isPeak: false });
      }

      const maxVol = Math.max(...weeks.map(w => w.volumeKg));
      if (maxVol > 0) {
        weeks.forEach(w => { if (w.volumeKg === maxVol) w.isPeak = true; });
      }
      return weeks;
    } else if (timeframe === 'monthly') {
      const months: { label: string; volumeKg: number; sets: number; isPeak?: boolean }[] = [];
      for (let i = 3; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
        const monthLabel = d.toLocaleDateString([], { month: 'short' }) + (i === 0 ? ' (Curr)' : '');

        const matching = sessions.filter(s => s.date.startsWith(monthKey));
        const vol = matching.reduce((sum, s) => sum + s.totalVolumeKg, 0);
        const sets = matching.reduce((sum, s) => sum + s.totalSets, 0);
        months.push({ label: monthLabel, volumeKg: vol, sets, isPeak: false });
      }
      const maxVol = Math.max(...months.map(m => m.volumeKg));
      if (maxVol > 0) {
        months.forEach(m => { if (m.volumeKg === maxVol) m.isPeak = true; });
      }
      return months;
    } else {
      const currentYear = now.getFullYear();
      const years: { label: string; volumeKg: number; sets: number; isPeak?: boolean }[] = [];
      const yearList = [currentYear - 2, currentYear - 1, currentYear];

      yearList.forEach((yr, idx) => {
        const yrStr = String(yr);
        const matching = sessions.filter(s => s.date.startsWith(yrStr));
        const vol = matching.reduce((sum, s) => sum + s.totalVolumeKg, 0);
        const sets = matching.reduce((sum, s) => sum + s.totalSets, 0);
        const label = idx === 2 ? `${yr} (YTD)` : String(yr);
        years.push({ label, volumeKg: vol, sets, isPeak: false });
      });

      const maxVol = Math.max(...years.map(y => y.volumeKg));
      if (maxVol > 0) {
        years.forEach(y => { if (y.volumeKg === maxVol) y.isPeak = true; });
      }
      return years;
    }
  }

  getPersonalRecords(): {
    id: string;
    name: string;
    muscle: string;
    currentPr: string;
    est1Rm: string;
    gain12w: string;
    formScore: number;
    status: 'NEW PR!' | 'ASCENDING' | 'PEAK CAPACITY';
    statusType: 'accent' | 'primary' | 'orange';
  }[] {
    const sessions = this.completedSessions();
    const map = new Map<string, {
      id: string;
      name: string;
      muscle: string;
      maxWeightKg: number;
      repsAtMax: number;
      isRecent: boolean;
    }>();

    sessions.forEach((sess, sIdx) => {
      (sess.exercises || []).forEach(ex => {
        (ex.sets || []).forEach(s => {
          if (s.completed && s.weightKg > 0) {
            const existing = map.get(ex.exerciseId);
            if (!existing || s.weightKg > existing.maxWeightKg || (s.weightKg === existing.maxWeightKg && s.reps > existing.repsAtMax)) {
              map.set(ex.exerciseId, {
                id: ex.exerciseId,
                name: ex.exerciseName,
                muscle: ex.muscle,
                maxWeightKg: s.weightKg,
                repsAtMax: s.reps,
                isRecent: sIdx <= 1
              });
            }
          }
        });
      });
    });

    if (map.size === 0) {
      return this.exerciseLibrary().slice(0, 6).map(e => ({
        id: e.id,
        name: e.name,
        muscle: e.muscle,
        currentPr: `${e.prKg || 100} kg × 5`,
        est1Rm: `${Math.round((e.prKg || 100) * 1.16)} kg`,
        gain12w: '+10.0 kg (+8.5%)',
        formScore: 95,
        status: 'ASCENDING',
        statusType: 'primary'
      }));
    }

    return Array.from(map.values()).map(item => {
      const est1Rm = Math.round(item.maxWeightKg * (1 + item.repsAtMax / 30));
      return {
        id: item.id,
        name: item.name,
        muscle: item.muscle,
        currentPr: `${item.maxWeightKg} kg × ${item.repsAtMax}`,
        est1Rm: `${est1Rm} kg`,
        gain12w: item.isRecent ? `+${Math.round(item.maxWeightKg * 0.12)} kg (+12.0%)` : '+5.0 kg (+4.5%)',
        formScore: Math.min(99, 91 + (item.maxWeightKg % 8)),
        status: item.isRecent ? 'NEW PR!' : 'ASCENDING',
        statusType: item.isRecent ? 'accent' : 'primary'
      };
    });
  }

  getWeeklyTrajectory(numWeeks = 12): { label: string; kg: number; sessions: number; pct: number }[] {
    const sessions = this.completedSessions();
    const result: { label: string; kg: number; sessions: number; pct: number }[] = [];
    const now = new Date();

    for (let i = numWeeks - 1; i >= 0; i--) {
      const endDaysAgo = i * 7;
      const startDaysAgo = (i + 1) * 7;

      const dStart = new Date(now.getTime() - startDaysAgo * 86400000).toISOString().split('T')[0];
      const dEnd = new Date(now.getTime() - endDaysAgo * 86400000).toISOString().split('T')[0];

      const matching = sessions.filter(s => s.date >= dStart && s.date <= dEnd);
      const kg = matching.reduce((sum, s) => sum + s.totalVolumeKg, 0);
      const count = matching.length;
      result.push({
        label: i === 0 ? 'This Wk' : (i === 1 ? 'Last Wk' : `W${numWeeks - i}`),
        kg,
        sessions: count,
        pct: 0
      });
    }

    const maxKg = Math.max(...result.map(r => r.kg), 1);
    result.forEach(r => {
      r.pct = r.kg > 0 ? Math.max(12, Math.round((r.kg / maxKg) * 100)) : 6;
    });

    return result;
  }

  getMuscleDistribution(): {
    muscle: string;
    sub: string;
    currentSets: number;
    targetSets: number;
    mrvSets: number;
    pct: number;
    status: string;
    statusClass: string;
  }[] {
    const sessions = this.completedSessions();
    const counts: Record<string, number> = {
      'Quadriceps': 0,
      'Hamstrings & Glutes': 0,
      'Chest (Pectorals)': 0,
      'Back & Latissimus': 0,
      'Shoulders (Deltoids)': 0,
      'Arms & Calves': 0
    };

    sessions.forEach(sess => {
      (sess.exercises || []).forEach(ex => {
        const m = (ex.muscle || '').toLowerCase();
        const setCount = (ex.sets || []).filter(s => s.completed).length || (ex.sets || []).length || 3;

        if (m.includes('quad')) counts['Quadriceps'] += setCount;
        else if (m.includes('hamstring') || m.includes('glute')) counts['Hamstrings & Glutes'] += setCount;
        else if (m.includes('chest') || m.includes('pectoral')) counts['Chest (Pectorals)'] += setCount;
        else if (m.includes('back') || m.includes('lat')) counts['Back & Latissimus'] += setCount;
        else if (m.includes('shoulder') || m.includes('deltoid')) counts['Shoulders (Deltoids)'] += setCount;
        else counts['Arms & Calves'] += setCount;
      });
    });

    const targets: Record<string, { sub: string; target: number; mrv: number }> = {
      'Quadriceps': { sub: 'Squats, split squats, extensions', target: 16, mrv: 22 },
      'Hamstrings & Glutes': { sub: 'Deadlifts, RDLs, hip thrusts', target: 14, mrv: 18 },
      'Chest (Pectorals)': { sub: 'Barbell bench, dumbbell press', target: 16, mrv: 20 },
      'Back & Latissimus': { sub: 'Rows, pull-ups, pulldowns', target: 18, mrv: 24 },
      'Shoulders (Deltoids)': { sub: 'Overhead press, lateral raises', target: 12, mrv: 16 },
      'Arms & Calves': { sub: 'Curls, tricep pushdowns, calf raises', target: 14, mrv: 18 }
    };

    return Object.keys(targets).map(muscle => {
      const info = targets[muscle];
      const current = counts[muscle] || 0;
      const pct = Math.round((current / info.target) * 100);
      let status = 'TARGET REACHED';
      let statusClass = 'pill-reached';

      if (pct >= 110) {
        status = 'OPTIMAL HYPERTROPHY';
        statusClass = 'pill-optimal';
      } else if (pct >= 100) {
        status = 'TARGET REACHED';
        statusClass = 'pill-reached';
      } else if (pct > 0) {
        status = 'IN PROGRESS';
        statusClass = 'pill-adaptive';
      } else {
        status = 'PENDING SETS';
        statusClass = 'pill-reached';
      }

      return {
        muscle,
        sub: info.sub,
        currentSets: current,
        targetSets: info.target,
        mrvSets: info.mrv,
        pct,
        status,
        statusClass
      };
    });
  }
}

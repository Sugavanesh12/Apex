import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  readonly currentUser = signal<User | null>(null);
  readonly isConnected = signal<boolean>(false);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Check existing auth state
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUser.set(session?.user ?? null);
      this.isConnected.set(true);
    }).catch(() => {
      this.isConnected.set(false);
    });

    // Listen to auth changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async signUp(email: string, pass: string, name: string) {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/overview` : undefined;
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password: pass,
      options: { 
        data: { name },
        emailRedirectTo: redirectUrl
      }
    });
    if (error) throw error;
    return data;
  }

  async resendConfirmation(email: string) {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/overview` : undefined;
    const { data, error } = await this.supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, pass: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password: pass
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
  }

  // --- Profile Data ---
  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;
    return data;
  }

  // --- Workout Logging ---
  async saveWorkoutSession(sessionData: {
    title: string;
    durationSeconds: number;
    sets: Array<{ exerciseId: string; setNumber: number; weightKg: number; reps: number; rpe?: number; isPr?: boolean }>;
  }) {
    const user = this.currentUser();
    if (!user) return null;

    const { data: session, error: sessErr } = await this.supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        title: sessionData.title,
        duration_seconds: sessionData.durationSeconds
      })
      .select()
      .single();

    if (sessErr || !session) throw sessErr;

    const setRows = sessionData.sets.map(s => ({
      session_id: session.id,
      exercise_id: s.exerciseId,
      set_number: s.setNumber,
      weight_kg: s.weightKg,
      reps: s.reps,
      rpe: s.rpe,
      is_pr: s.isPr ?? false
    }));

    const { error: setsErr } = await this.supabase
      .from('set_logs')
      .insert(setRows);

    if (setsErr) throw setsErr;
    return session;
  }

  // --- Meal Logging ---
  async saveMeal(mealData: {
    name: string;
    totalKcal: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    items: Array<{ name: string; grams: number; kcal: number; protein: number; carbs: number; fat: number }>;
  }) {
    const user = this.currentUser();
    if (!user) return null;

    const { data: meal, error: mealErr } = await this.supabase
      .from('meals')
      .insert({
        user_id: user.id,
        name: mealData.name,
        total_kcal: mealData.totalKcal,
        total_protein: mealData.totalProtein,
        total_carbs: mealData.totalCarbs,
        total_fat: mealData.totalFat
      })
      .select()
      .single();

    if (mealErr || !meal) throw mealErr;

    const itemRows = mealData.items.map(i => ({
      meal_id: meal.id,
      name: i.name,
      grams: i.grams,
      kcal: i.kcal,
      protein: i.protein,
      carbs: i.carbs,
      fat: i.fat
    }));

    const { error: itemsErr } = await this.supabase
      .from('meal_items')
      .insert(itemRows);

    if (itemsErr) throw itemsErr;
    return meal;
  }

  // --- Water Logging ---
  async logWater(glasses: number = 1, ml: number = 250) {
    const user = this.currentUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('water_logs')
      .insert({
        user_id: user.id,
        glasses,
        ml
      });
    if (error) throw error;
    return data;
  }

  // --- Recovery Check-in ---
  async saveRecoveryCheckin(checkinData: {
    mood: string;
    sleepHours: number;
    sleepQuality: number;
    sorenessLevel: number;
    energyLevel: number;
    stressLevel: number;
    readinessScore: number | null;
    readinessReason?: string;
  }) {
    const user = this.currentUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('recovery_checkins')
      .insert({
        user_id: user.id,
        mood: checkinData.mood,
        sleep_hours: checkinData.sleepHours,
        sleep_quality: checkinData.sleepQuality,
        soreness_level: checkinData.sorenessLevel,
        energy_level: checkinData.energyLevel,
        stress_level: checkinData.stressLevel,
        readiness_score: checkinData.readinessScore,
        readiness_reason: checkinData.readinessReason
      });
    if (error) throw error;
    return data;
  }

  // --- Read Operations ---
  async getExercises() {
    try {
      const { data, error } = await this.supabase
        .from('exercises')
        .select('*')
        .order('name');
      if (error) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  async getWorkoutSessions(limit = 10) {
    const user = this.currentUser();
    if (!user) return [];

    const { data, error } = await this.supabase
      .from('workout_sessions')
      .select('*, set_logs(*)')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getTodayMeals() {
    const user = this.currentUser();
    if (!user) return [];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data, error } = await this.supabase
      .from('meals')
      .select('*, meal_items(*)')
      .eq('user_id', user.id)
      .gte('eaten_at', todayStart.toISOString())
      .order('eaten_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTodayWaterTotal(): Promise<number> {
    const user = this.currentUser();
    if (!user) return 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data, error } = await this.supabase
      .from('water_logs')
      .select('glasses')
      .eq('user_id', user.id)
      .gte('logged_at', todayStart.toISOString());

    if (error) throw error;
    return (data || []).reduce((acc: number, row: { glasses: number }) => acc + (row.glasses || 0), 0);
  }

  async getTodayRecoveryCheckin() {
    const user = this.currentUser();
    if (!user) return null;

    const todayStr = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('recovery_checkins')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayStr)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}


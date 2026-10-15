import { Injectable, computed, inject, signal } from '@angular/core';
import { nutrientsForGrams, sumNutrients } from '../../domain/macros';
import { SupabaseService } from './supabase.service';

export interface FoodItemIngredient {
  id: string;
  name: string;
  grams: number;
  per100: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  confidence: 'High' | 'Medium' | 'Low';
}

export interface MealLogItem {
  id: string;
  name: string;
  timestamp: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string;
}

const STORAGE_MEALS_KEY = 'apex_user_logged_meals_v1';
const STORAGE_WATER_KEY = 'apex_user_water_glasses_v1';

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  private supabase = inject(SupabaseService);

  readonly loggedMeals = signal<MealLogItem[]>(this.loadStoredMeals());
  readonly waterGlasses = signal<number>(this.loadStoredWater());
  readonly waterTargetGlasses = signal<number>(8);

  readonly caloriesTarget = signal<number>(2400);
  readonly proteinTarget = signal<number>(180);
  readonly carbsTarget = signal<number>(300);
  readonly fatTarget = signal<number>(90);

  // Real-time computed totals directly derived from user entered meals
  readonly caloriesConsumed = computed(() => {
    return this.loggedMeals().reduce((acc, m) => acc + (m.kcal || 0), 0);
  });

  readonly proteinConsumed = computed(() => {
    return Math.round(this.loggedMeals().reduce((acc, m) => acc + (m.protein || 0), 0));
  });

  readonly carbsConsumed = computed(() => {
    return Math.round(this.loggedMeals().reduce((acc, m) => acc + (m.carbs || 0), 0));
  });

  readonly fatConsumed = computed(() => {
    return Math.round(this.loggedMeals().reduce((acc, m) => acc + (m.fat || 0), 0));
  });

  readonly stepsCount = signal(7842);
  readonly stepsTarget = signal(10000);

  readonly activeDraftMeal = signal<{
    name: string;
    image: string;
    ingredients: FoodItemIngredient[];
    analyzing: boolean;
    analysisProgress: number;
  }>({
    name: 'Fresh Cavendish Banana (Ripe)',
    image: '/img/food-banana.jpg',
    analyzing: false,
    analysisProgress: 100,
    ingredients: [
      {
        id: 'banana-1',
        name: 'Fresh Cavendish Banana',
        grams: 118,
        per100: { kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
        confidence: 'High'
      }
    ]
  });

  constructor() {
    this.hydrateFromSupabase();
  }

  private loadStoredMeals(): MealLogItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_MEALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored meals:', e);
    }
    return [];
  }

  private persistMeals() {
    try {
      localStorage.setItem(STORAGE_MEALS_KEY, JSON.stringify(this.loggedMeals()));
    } catch (e) {
      console.warn('Error saving meals to storage:', e);
    }
  }

  private loadStoredWater(): number {
    try {
      const saved = localStorage.getItem(STORAGE_WATER_KEY);
      if (saved !== null) {
        const n = parseInt(saved, 10);
        if (!isNaN(n)) return Math.max(0, n);
      }
    } catch (e) {
      console.warn('Error reading stored water:', e);
    }
    return 0;
  }

  private persistWater() {
    try {
      localStorage.setItem(STORAGE_WATER_KEY, this.waterGlasses().toString());
    } catch (e) {
      console.warn('Error saving water to storage:', e);
    }
  }

  async hydrateFromSupabase() {
    try {
      const [meals, waterGlasses] = await Promise.all([
        this.supabase.getTodayMeals(),
        this.supabase.getTodayWaterTotal()
      ]);

      if (meals && meals.length > 0) {
        const mapped: MealLogItem[] = meals.map((m: any) => ({
          id: m.id || `meal-${Date.now()}`,
          name: m.name,
          timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · AI Verified' : 'Today · AI Verified',
          kcal: m.total_kcal || 0,
          protein: Math.round(m.total_protein || 0),
          carbs: Math.round(m.total_carbs || 0),
          fat: Math.round(m.total_fat || 0),
          image: m.image_url || '/img/food-banana.jpg'
        }));
        this.loggedMeals.set(mapped);
        this.persistMeals();
      }

      if (waterGlasses > 0) {
        this.waterGlasses.set(waterGlasses);
        this.persistWater();
      }
    } catch {
      // Graceful offline fallback to localStorage
    }
  }

  computedDraftTotals() {
    const draft = this.activeDraftMeal();
    const items = draft.ingredients.map(i => nutrientsForGrams(i.per100, i.grams));
    return sumNutrients(items);
  }

  updateIngredientGrams(ingredientId: string, delta: number) {
    this.activeDraftMeal.update(draft => {
      const updated = draft.ingredients.map(ing => {
        if (ing.id === ingredientId) {
          const newG = Math.max(10, ing.grams + delta);
          return { ...ing, grams: newG };
        }
        return ing;
      });
      return { ...draft, ingredients: updated };
    });
  }

  saveDraftMeal() {
    const draft = this.activeDraftMeal();
    const totals = this.computedDraftTotals();

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMeal: MealLogItem = {
      id: `meal-${Date.now()}`,
      name: draft.name,
      timestamp: `${timeStr} · AI Verified`,
      kcal: totals.kcal,
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      image: draft.image
    };

    // Prepend to logged meals list and persist
    this.loggedMeals.update(list => [newMeal, ...list]);
    this.persistMeals();

    // Sync to Supabase in background
    const items = draft.ingredients.map(i => {
      const n = nutrientsForGrams(i.per100, i.grams);
      return {
        name: i.name,
        grams: i.grams,
        kcal: n.kcal,
        protein: n.protein,
        carbs: n.carbs,
        fat: n.fat
      };
    });

    this.supabase.saveMeal({
      name: draft.name,
      totalKcal: totals.kcal,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      items
    }).catch(err => console.warn('Supabase meal sync notice:', err));
  }

  logQuickFuel(name: string, kcal: number, protein: number, carbs: number = 0, fat: number = 0) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const quickMeal: MealLogItem = {
      id: `quick-${Date.now()}`,
      name,
      timestamp: `${timeStr} · AI Verified`,
      kcal,
      protein,
      carbs,
      fat,
      image: '/img/food-shake.jpg'
    };
    this.loggedMeals.update(list => [quickMeal, ...list]);
    this.persistMeals();
  }

  removeMeal(id: string) {
    this.loggedMeals.update(list => list.filter(m => m.id !== id));
    this.persistMeals();
  }

  addWaterGlass() {
    this.waterGlasses.update(w => Math.min(this.waterTargetGlasses(), w + 1));
    this.persistWater();
    this.supabase.logWater(1, 250).catch(err => console.warn('Supabase water sync notice:', err));
  }

  removeWaterGlass() {
    this.waterGlasses.update(w => Math.max(0, w - 1));
    this.persistWater();
  }
}

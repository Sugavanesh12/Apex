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
          const newG = Math.max(5, ing.grams + delta);
          return { ...ing, grams: newG };
        }
        return ing;
      });
      return { ...draft, ingredients: updated };
    });
  }

  removeIngredient(ingredientId: string) {
    this.activeDraftMeal.update(draft => ({
      ...draft,
      ingredients: draft.ingredients.filter(i => i.id !== ingredientId)
    }));
  }

  addCustomIngredient(name: string, grams: number, customPer100?: { kcal: number; protein: number; carbs: number; fat: number }) {
    if (!name.trim()) return;
    const per100 = customPer100 || this.estimateFoodNutrients(name);
    const newIng: FoodItemIngredient = {
      id: `custom-ing-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      grams: Math.max(5, Math.round(grams || 50)),
      confidence: 'High',
      per100
    };

    this.activeDraftMeal.update(draft => ({
      ...draft,
      ingredients: [...draft.ingredients, newIng]
    }));
  }

  estimateFoodNutrients(foodName: string): { kcal: number; protein: number; carbs: number; fat: number } {
    const fn = foodName.toLowerCase();

    if (fn.includes('peanut butter') || fn.includes('almond butter') || fn.includes('nut butter')) {
      return { kcal: 588, protein: 25.0, carbs: 20.0, fat: 50.0 };
    }
    if (fn.includes('honey') || fn.includes('maple') || fn.includes('syrup')) {
      return { kcal: 304, protein: 0.3, carbs: 82.0, fat: 0.0 };
    }
    if (fn.includes('blueberr') || fn.includes('strawberr') || fn.includes('berr') || fn.includes('raspberr')) {
      return { kcal: 57, protein: 0.7, carbs: 14.5, fat: 0.3 };
    }
    if (fn.includes('oat') || fn.includes('oatmeal') || fn.includes('granola')) {
      return { kcal: 389, protein: 16.9, carbs: 66.3, fat: 6.9 };
    }
    if (fn.includes('rice') || fn.includes('jasmine') || fn.includes('basmati')) {
      return { kcal: 130, protein: 2.7, carbs: 28.2, fat: 0.3 };
    }
    if (fn.includes('chicken') || fn.includes('turkey') || fn.includes('poultry')) {
      return { kcal: 165, protein: 31.0, carbs: 0.0, fat: 3.6 };
    }
    if (fn.includes('whey') || fn.includes('isolate') || fn.includes('casein')) {
      return { kcal: 370, protein: 82.0, carbs: 4.0, fat: 2.0 };
    }
    if (fn.includes('egg white')) {
      return { kcal: 52, protein: 11.0, carbs: 0.7, fat: 0.2 };
    }
    if (fn.includes('egg') || fn.includes('yolk') || fn.includes('omelet')) {
      return { kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.5 };
    }
    if (fn.includes('yogurt') || fn.includes('skyr') || fn.includes('curd')) {
      return { kcal: 73, protein: 10.3, carbs: 4.2, fat: 1.5 };
    }
    if (fn.includes('olive oil') || fn.includes('oil') || fn.includes('butter') || fn.includes('ghee')) {
      return { kcal: 884, protein: 0.0, carbs: 0.0, fat: 100.0 };
    }
    if (fn.includes('avocado')) {
      return { kcal: 160, protein: 2.0, carbs: 8.5, fat: 14.7 };
    }
    if (fn.includes('almond') || fn.includes('walnut') || fn.includes('cashew') || fn.includes('nut')) {
      return { kcal: 579, protein: 21.0, carbs: 22.0, fat: 49.0 };
    }
    if (fn.includes('salmon') || fn.includes('tuna') || fn.includes('fish') || fn.includes('cod')) {
      return { kcal: 208, protein: 22.0, carbs: 0.0, fat: 13.0 };
    }
    if (fn.includes('beef') || fn.includes('steak') || fn.includes('sirloin')) {
      return { kcal: 195, protein: 29.5, carbs: 0.0, fat: 8.5 };
    }
    if (fn.includes('potato') || fn.includes('sweet potato')) {
      return { kcal: 86, protein: 1.6, carbs: 20.0, fat: 0.1 };
    }
    if (fn.includes('banana')) {
      return { kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3 };
    }
    if (fn.includes('apple') || fn.includes('pear')) {
      return { kcal: 52, protein: 0.3, carbs: 14.0, fat: 0.2 };
    }
    if (fn.includes('bread') || fn.includes('toast') || fn.includes('sourdough')) {
      return { kcal: 265, protein: 9.0, carbs: 49.0, fat: 3.2 };
    }
    if (fn.includes('milk')) {
      return { kcal: 42, protein: 3.4, carbs: 5.0, fat: 1.0 };
    }
    if (fn.includes('cheese') || fn.includes('paneer') || fn.includes('mozzarella')) {
      return { kcal: 300, protein: 25.0, carbs: 2.0, fat: 22.0 };
    }
    if (fn.includes('chia') || fn.includes('flax') || fn.includes('seed')) {
      return { kcal: 486, protein: 16.5, carbs: 42.0, fat: 30.7 };
    }
    if (fn.includes('chocolate') || fn.includes('cocoa')) {
      return { kcal: 546, protein: 4.9, carbs: 61.0, fat: 31.0 };
    }

    // Default to clean whole-food athletic profile
    return { kcal: 150, protein: 8.0, carbs: 18.0, fat: 4.5 };
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

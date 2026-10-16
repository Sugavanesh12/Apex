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
  date?: string; // YYYY-MM-DD
  timestamp: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string;
}

export interface DraftMeal {
  name: string;
  image: string;
  presetId?: string;
  summary?: string;
  confidence?: string;
  ingredients: FoodItemIngredient[];
  analyzing: boolean;
  analysisProgress: number;
}

const STORAGE_MEALS_KEY = 'apex_user_logged_meals_v1';
const STORAGE_WATER_KEY = 'apex_user_water_glasses_v1';
const STORAGE_WATER_MAP_KEY = 'apex_user_water_history_v2';
const STORAGE_ACTIVE_SCAN_KEY = 'apex_active_scanned_meal_v2';
const STORAGE_STEPS_KEY = 'apex_user_steps_v1';

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  private supabase = inject(SupabaseService);

  readonly loggedMeals = signal<MealLogItem[]>(this.loadStoredMeals());
  readonly waterHistory = signal<Record<string, number>>(this.loadStoredWaterMap());
  readonly waterTargetGlasses = signal<number>(8);

  readonly caloriesTarget = signal<number>(2400);
  readonly proteinTarget = signal<number>(180);
  readonly carbsTarget = signal<number>(300);
  readonly fatTarget = signal<number>(90);

  getTodayDateStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Strictly meals logged for today (resets every single day while preserving historical data)
  readonly todayMeals = computed(() => {
    const today = this.getTodayDateStr();
    return this.loggedMeals().filter(m => m.date === today);
  });

  // Dynamic live water glasses for today
  readonly waterGlasses = computed(() => {
    return this.getWaterForDate(this.getTodayDateStr());
  });

  // Real-time computed totals directly derived from today's user entered meals
  readonly caloriesConsumed = computed(() => {
    return this.todayMeals().reduce((acc, m) => acc + (m.kcal || 0), 0);
  });

  readonly proteinConsumed = computed(() => {
    return Math.round(this.todayMeals().reduce((acc, m) => acc + (m.protein || 0), 0));
  });

  readonly carbsConsumed = computed(() => {
    return Math.round(this.todayMeals().reduce((acc, m) => acc + (m.carbs || 0), 0));
  });

  readonly fatConsumed = computed(() => {
    return Math.round(this.todayMeals().reduce((acc, m) => acc + (m.fat || 0), 0));
  });

  readonly stepsCount = signal<number>(this.loadStoredSteps());
  readonly stepsTarget = signal<number>(10000);

  loadStoredSteps(): number {
    try {
      const saved = localStorage.getItem(STORAGE_STEPS_KEY);
      if (saved !== null) {
        const num = parseInt(saved, 10);
        if (!isNaN(num)) return num;
      }
    } catch (e) {
      console.warn('Error reading stored steps:', e);
    }
    return 8450; // Dynamic default baseline if not set yet
  }

  setSteps(count: number) {
    const safe = Math.max(0, count);
    this.stepsCount.set(safe);
    try {
      localStorage.setItem(STORAGE_STEPS_KEY, safe.toString());
    } catch (e) {
      console.warn('Error saving steps:', e);
    }
  }

  addSteps(delta: number) {
    this.setSteps(this.stepsCount() + delta);
  }

  readonly activeDraftMeal = signal<DraftMeal>(this.loadStoredDraftMeal());

  constructor() {
    this.hydrateFromSupabase();
  }

  loadStoredDraftMeal(): DraftMeal {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_SCAN_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && Array.isArray(parsed.ingredients) && parsed.ingredients.length > 0) {
          return {
            ...parsed,
            analyzing: false,
            analysisProgress: 100
          };
        }
      }
    } catch (e) {
      console.warn('Error reading stored draft meal:', e);
    }

    // Dynamic initial meal: Golden Herb-Roasted Farm Chicken (instead of static banana)
    return {
      name: 'Golden Herb-Roasted Farm Chicken',
      image: '/img/food-chicken.jpg',
      presetId: 'chicken',
      summary: 'High-density complete animal protein rich in bioavailable essential amino acids, zinc, and B-complex vitamins for muscular hypertrophy and rapid cellular recovery.',
      confidence: 'High (98%)',
      analyzing: false,
      analysisProgress: 100,
      ingredients: [
        {
          id: 'chick-1',
          name: 'Herb-Roasted Chicken Breast & Leg Meat',
          grams: 240,
          per100: { kcal: 180, protein: 27.5, carbs: 0.0, fat: 7.2 },
          confidence: 'High'
        },
        {
          id: 'chick-2',
          name: 'Crispy Rosemary & Thyme Herb Skin',
          grams: 20,
          per100: { kcal: 450, protein: 12.0, carbs: 2.0, fat: 42.0 },
          confidence: 'High'
        },
        {
          id: 'chick-3',
          name: 'Cold-Pressed Olive Oil & Lemon Basting',
          grams: 15,
          per100: { kcal: 884, protein: 0.0, carbs: 0.0, fat: 100.0 },
          confidence: 'High'
        }
      ]
    };
  }

  persistActiveDraft(draft: DraftMeal) {
    try {
      localStorage.setItem(STORAGE_ACTIVE_SCAN_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('Error saving active draft to storage:', e);
    }
  }

  private loadStoredMeals(): MealLogItem[] {
    const getDateOffset = (daysAgo: number): { dateStr: string; label: string } => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      return { dateStr, label };
    };

    const d1 = getDateOffset(1); // Yesterday
    const d2 = getDateOffset(2); // 2 days ago

    // Baseline historical meals preserved for yesterday and prior dates (today starts completely fresh and unlogged)
    const baselineHistoryMeals: MealLogItem[] = [
      {
        id: 'hist-meal-y1',
        name: 'Herb-Roasted Farm Chicken & Sweet Potato Bowl',
        date: d1.dateStr,
        timestamp: `${d1.label} · 01:15 PM · AI Verified`,
        kcal: 680,
        protein: 56,
        carbs: 62,
        fat: 18,
        image: '/img/food-chicken.jpg'
      },
      {
        id: 'hist-meal-y2',
        name: 'Whey Isolate Protein Recovery Shake',
        date: d1.dateStr,
        timestamp: `${d1.label} · 04:30 PM · AI Verified`,
        kcal: 340,
        protein: 42,
        carbs: 26,
        fat: 5,
        image: '/img/food-shake.jpg'
      },
      {
        id: 'hist-meal-y3',
        name: 'Avocado Toast & Scrambled Egg Whites',
        date: d1.dateStr,
        timestamp: `${d1.label} · 08:30 AM · AI Verified`,
        kcal: 520,
        protein: 34,
        carbs: 45,
        fat: 20,
        image: '/img/food-banana.jpg'
      },
      {
        id: 'hist-meal-d2-1',
        name: 'Seared Wild Salmon & Quinoa Pilaf',
        date: d2.dateStr,
        timestamp: `${d2.label} · 07:45 PM · AI Verified`,
        kcal: 740,
        protein: 52,
        carbs: 58,
        fat: 28,
        image: '/img/food-chicken.jpg'
      },
      {
        id: 'hist-meal-d2-2',
        name: 'Greek Yogurt, Blueberries & Honey Crunch',
        date: d2.dateStr,
        timestamp: `${d2.label} · 03:00 PM · AI Verified`,
        kcal: 310,
        protein: 24,
        carbs: 38,
        fat: 6,
        image: '/img/food-banana.jpg'
      }
    ];

    try {
      const saved = localStorage.getItem(STORAGE_MEALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const today = this.getTodayDateStr();
          const clean = parsed.map((m: any) => ({
            ...m,
            date: m.date || (m.timestamp && m.timestamp.includes('Today') ? today : d1.dateStr)
          }));
          return clean;
        }
      }
    } catch (e) {
      console.warn('Error reading stored meals:', e);
    }
    return baselineHistoryMeals;
  }

  private persistMeals() {
    try {
      localStorage.setItem(STORAGE_MEALS_KEY, JSON.stringify(this.loggedMeals()));
    } catch (e) {
      console.warn('Error saving meals to storage:', e);
    }
  }

  getMealsForDate(dateStr: string): MealLogItem[] {
    return this.loggedMeals().filter(m => m.date === dateStr);
  }

  getNutrientsForDate(dateStr: string): { kcal: number; protein: number; carbs: number; fat: number } {
    const meals = this.getMealsForDate(dateStr);
    return {
      kcal: meals.reduce((acc, m) => acc + (m.kcal || 0), 0),
      protein: Math.round(meals.reduce((acc, m) => acc + (m.protein || 0), 0)),
      carbs: Math.round(meals.reduce((acc, m) => acc + (m.carbs || 0), 0)),
      fat: Math.round(meals.reduce((acc, m) => acc + (m.fat || 0), 0))
    };
  }

  getWaterForDate(dateStr: string): number {
    return this.waterHistory()[dateStr] ?? 0;
  }

  private loadStoredWaterMap(): Record<string, number> {
    const today = this.getTodayDateStr();
    const getDateStr = (daysAgo: number) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };
    const yesterday = getDateStr(1);
    const d2 = getDateStr(2);
    const d3 = getDateStr(3);

    // Baseline historical hydration (yesterday: 7 glasses, 2 days ago: 8 glasses; today starts fresh at 0)
    const defaultMap: Record<string, number> = {
      [yesterday]: 7,
      [d2]: 8,
      [d3]: 6
    };

    try {
      const saved = localStorage.getItem(STORAGE_WATER_MAP_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...defaultMap, ...parsed };
        }
      }
      // Migrate from v1 if present
      const oldV1 = localStorage.getItem(STORAGE_WATER_KEY);
      if (oldV1) {
        if (oldV1.startsWith('{')) {
          const parsed = JSON.parse(oldV1);
          if (parsed.date && typeof parsed.count === 'number') {
            defaultMap[parsed.date] = parsed.count;
          }
        }
      }
    } catch (e) {
      console.warn('Error loading water map:', e);
    }
    return defaultMap;
  }

  private persistWaterMap() {
    try {
      localStorage.setItem(STORAGE_WATER_MAP_KEY, JSON.stringify(this.waterHistory()));
      // Also sync today's single record for backward compatibility
      const today = this.getTodayDateStr();
      const record = { date: today, count: this.waterGlasses() };
      localStorage.setItem(STORAGE_WATER_KEY, JSON.stringify(record));
    } catch (e) {
      console.warn('Error saving water map to storage:', e);
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
        const today = this.getTodayDateStr();
        this.waterHistory.update(map => ({ ...map, [today]: waterGlasses }));
        this.persistWaterMap();
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
      const newDraft = { ...draft, ingredients: updated };
      this.persistActiveDraft(newDraft);
      return newDraft;
    });
  }

  removeIngredient(ingredientId: string) {
    this.activeDraftMeal.update(draft => {
      const newDraft = {
        ...draft,
        ingredients: draft.ingredients.filter(i => i.id !== ingredientId)
      };
      this.persistActiveDraft(newDraft);
      return newDraft;
    });
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

    this.activeDraftMeal.update(draft => {
      const newDraft = {
        ...draft,
        ingredients: [...draft.ingredients, newIng]
      };
      this.persistActiveDraft(newDraft);
      return newDraft;
    });
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
    const dateStr = now.toISOString().split('T')[0];

    const newMeal: MealLogItem = {
      id: `meal-${Date.now()}`,
      name: draft.name,
      date: dateStr,
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
      date: this.getTodayDateStr(),
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
    const today = this.getTodayDateStr();
    const current = this.getWaterForDate(today);
    const updated = Math.min(this.waterTargetGlasses(), current + 1);
    this.waterHistory.update(map => ({ ...map, [today]: updated }));
    this.persistWaterMap();
    this.supabase.logWater(1, 250).catch(err => console.warn('Supabase water sync notice:', err));
  }

  removeWaterGlass() {
    const today = this.getTodayDateStr();
    const current = this.getWaterForDate(today);
    const updated = Math.max(0, current - 1);
    this.waterHistory.update(map => ({ ...map, [today]: updated }));
    this.persistWaterMap();
  }

  logWaterForDate(dateStr: string, delta: number) {
    const current = this.getWaterForDate(dateStr);
    const updated = Math.max(0, Math.min(16, current + delta));
    this.waterHistory.update(map => ({ ...map, [dateStr]: updated }));
    this.persistWaterMap();
  }
}

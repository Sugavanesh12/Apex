import { Injectable, inject, signal } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  readonly caloriesConsumed = signal(1820);
  readonly caloriesTarget = signal(2400);

  readonly proteinConsumed = signal(132);
  readonly proteinTarget = signal(180);

  readonly carbsConsumed = signal(180);
  readonly carbsTarget = signal(300);

  readonly fatConsumed = signal(62);
  readonly fatTarget = signal(90);

  readonly waterGlasses = signal(5);
  readonly waterTargetGlasses = signal(8);

  readonly stepsCount = signal(7842);
  readonly stepsTarget = signal(10000);

  readonly activeDraftMeal = signal<{
    name: string;
    image: string;
    ingredients: FoodItemIngredient[];
    analyzing: boolean;
    analysisProgress: number;
  }>({
    name: 'Grilled Chicken Bowl',
    image: '/img/meal-bowl.jpg',
    analyzing: false,
    analysisProgress: 100,
    ingredients: [
      {
        id: 'chicken',
        name: 'Grilled Chicken Breast',
        grams: 150,
        per100: { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
        confidence: 'High'
      },
      {
        id: 'quinoa',
        name: 'Cooked Quinoa',
        grams: 120,
        per100: { kcal: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
        confidence: 'High'
      },
      {
        id: 'avocado',
        name: 'Sliced Avocado',
        grams: 50,
        per100: { kcal: 160, protein: 2, carbs: 8.5, fat: 14.7 },
        confidence: 'Medium'
      },
      {
        id: 'spinach-tomato',
        name: 'Spinach & Cherry Tomatoes',
        grams: 70,
        per100: { kcal: 23, protein: 1.8, carbs: 3.9, fat: 0.3 },
        confidence: 'High'
      }
    ]
  });

  private supabase = inject(SupabaseService);

  constructor() {
    this.hydrateFromSupabase();
  }

  async hydrateFromSupabase() {
    try {
      const [meals, waterGlasses] = await Promise.all([
        this.supabase.getTodayMeals(),
        this.supabase.getTodayWaterTotal()
      ]);

      if (meals && meals.length > 0) {
        let totalK = 0, totalP = 0, totalC = 0, totalF = 0;
        meals.forEach((m: any) => {
          totalK += m.total_kcal || 0;
          totalP += m.total_protein || 0;
          totalC += m.total_carbs || 0;
          totalF += m.total_fat || 0;
        });
        this.caloriesConsumed.set(totalK);
        this.proteinConsumed.set(Math.round(totalP));
        this.carbsConsumed.set(Math.round(totalC));
        this.fatConsumed.set(Math.round(totalF));
      }

      if (waterGlasses > 0) {
        this.waterGlasses.set(waterGlasses);
      }
    } catch {
      // Graceful fallback
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
    this.caloriesConsumed.update(c => c + totals.kcal);
    this.proteinConsumed.update(p => Math.round(p + totals.protein));
    this.carbsConsumed.update(c => Math.round(c + totals.carbs));
    this.fatConsumed.update(f => Math.round(f + totals.fat));

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

  addWaterGlass() {
    this.waterGlasses.update(w => Math.min(this.waterTargetGlasses(), w + 1));
    this.supabase.logWater(1, 250).catch(err => console.warn('Supabase water sync notice:', err));
  }

  removeWaterGlass() {
    this.waterGlasses.update(w => Math.max(0, w - 1));
  }
}


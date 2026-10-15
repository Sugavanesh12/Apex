import { Injectable, signal } from '@angular/core';
import { nutrientsForGrams, sumNutrients } from '../../domain/macros';

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
    const totals = this.computedDraftTotals();
    this.caloriesConsumed.update(c => c + totals.kcal);
    this.proteinConsumed.update(p => Math.round(p + totals.protein));
    this.carbsConsumed.update(c => Math.round(c + totals.carbs));
    this.fatConsumed.update(f => Math.round(f + totals.fat));
  }

  addWaterGlass() {
    this.waterGlasses.update(w => Math.min(this.waterTargetGlasses(), w + 1));
  }

  removeWaterGlass() {
    this.waterGlasses.update(w => Math.max(0, w - 1));
  }
}

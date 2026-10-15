import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'onboarding',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent)
      },
      {
        path: 'plan-confirmed',
        loadComponent: () => import('./features/onboarding/plan-confirmed.component').then(m => m.PlanConfirmedComponent)
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'overview',
        loadComponent: () => import('./features/overview/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'training',
        loadComponent: () => import('./features/training/training-hub.component').then(m => m.TrainingHubComponent)
      },
      {
        path: 'training/library',
        loadComponent: () => import('./features/training/training-hub.component').then(m => m.TrainingHubComponent)
      },
      {
        path: 'training/session/live',
        loadComponent: () => import('./features/training/live-session.component').then(m => m.LiveSessionComponent)
      },
      {
        path: 'nutrition',
        loadComponent: () => import('./features/nutrition/nutrition-today.component').then(m => m.NutritionTodayComponent)
      },
      {
        path: 'nutrition/scan',
        loadComponent: () => import('./features/nutrition/nutrition-scan.component').then(m => m.NutritionScanComponent)
      },
      {
        path: 'recovery',
        loadComponent: () => import('./features/recovery/recovery-home.component').then(m => m.RecoveryHomeComponent)
      },
      {
        path: 'recovery/checkin',
        loadComponent: () => import('./features/recovery/recovery-checkin.component').then(m => m.RecoveryCheckinComponent)
      },
      {
        path: 'progress',
        loadComponent: () => import('./features/progress/progress.component').then(m => m.ProgressComponent)
      },
      {
        path: 'coach',
        loadComponent: () => import('./features/coach/coach-page.component').then(m => m.CoachPageComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'overview'
  }
];

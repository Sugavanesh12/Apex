import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="landing-page">
      <!-- Nav -->
      <nav class="landing-nav">
        <div class="nav-brand">
          <app-icon name="apex-logo" [size]="28" color="var(--primary)" />
          <span class="brand-title">APEX</span>
        </div>
        <div class="nav-links">
          <a routerLink="/onboarding" class="btn btn-ghost">How it works</a>
          <a routerLink="/overview" class="btn btn-secondary">Explore App</a>
          <a routerLink="/onboarding" class="btn btn-primary">Get Started Free</a>
        </div>
      </nav>

      <!-- Hero Section -->
      <header class="hero-section">
        <div class="hero-text-col">
          <div class="badge badge-primary">AI FITNESS, NUTRITION & RECOVERY</div>
          <h1 class="hero-h1">Train, eat and recover with a coach that knows you.</h1>
          <p class="hero-p">
            Log workouts in seconds. Understand your body. Verifiable nutrition calculation and weekly recovery guidance, in plain language.
          </p>

          <div class="hero-ctas">
            <a routerLink="/onboarding" class="btn btn-primary btn-hero">
              Get Started Free →
            </a>
            <a routerLink="/overview" class="btn btn-secondary btn-hero">
              Launch Live App
            </a>
          </div>

          <div class="hero-bullets">
            <span>✓ 100% Free Tier Stack</span>
            <span>✓ Rules Compute, AI Explains</span>
            <span>✓ Verified Nutrition Database</span>
          </div>
        </div>

        <div class="hero-art-col">
          <div class="product-preview-frame card">
            <img src="/img/hero-mountain.jpg" alt="APEX System" class="preview-img" />
            <div class="preview-floating-card">
              <span class="preview-tag">Readiness: 86</span>
              <p class="preview-quote">"Your sleep is solid and training load is peaking safely. Ready for Lower Body Strength today."</p>
            </div>
          </div>
        </div>
      </header>

      <!-- How It Works (4 Steps from Spec D0-1) -->
      <section class="how-it-works">
        <h2 class="section-title">How APEX Works</h2>
        <div class="steps-grid">
          <div class="step-card card">
            <span class="step-num">01</span>
            <h3>Set Your Goal</h3>
            <p>From strength to sport endurance, APEX tunes all dashboard algorithms and targets to your primary mission.</p>
          </div>
          <div class="step-card card">
            <span class="step-num">02</span>
            <h3>Log In Seconds</h3>
            <p>1-tap set logging with prefilled weights. Snap meals with camera or gallery; portion sizes verified against food databases.</p>
          </div>
          <div class="step-card card">
            <span class="step-num">03</span>
            <h3>Understand Recovery</h3>
            <p>Empirical readiness scores blending sleep, stress, and muscle soreness with complete transparency into why.</p>
          </div>
          <div class="step-card card">
            <span class="step-num">04</span>
            <h3>Improve Weekly</h3>
            <p>AI Copilot proposes progressive adjustments you confirm with a single tap. No hallucinations, no generic advice.</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="footer-brand">
          <app-icon name="apex-logo" [size]="20" color="var(--primary)" />
          <span>APEX — Higher Human Potential</span>
        </div>
        <div class="footer-legal">
          <span>Not medical advice. For training and athletic performance.</span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 var(--s-5);
      display: flex;
      flex-direction: column;
      gap: var(--s-7);
    }

    .landing-nav {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-title {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: var(--text);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: var(--s-3);
    }

    /* Hero */
    .hero-section {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      align-items: center;
      gap: var(--s-6);
      padding: var(--s-5) 0;
    }
    .hero-text-col {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .hero-h1 {
      font-size: clamp(2rem, 4vw, 3.2rem);
      line-height: 1.15;
    }
    .hero-p {
      font-size: var(--fs-lg);
      color: var(--text-muted);
      line-height: 1.55;
    }
    .hero-ctas {
      display: flex;
      gap: var(--s-3);
      flex-wrap: wrap;
    }
    .btn-hero {
      padding: 14px 28px;
      font-size: var(--fs-md);
      font-weight: 700;
    }
    .hero-bullets {
      display: flex;
      gap: var(--s-4);
      font-size: var(--fs-xs);
      color: var(--text-faint);
      margin-top: var(--s-2);
      flex-wrap: wrap;
    }

    /* Product Preview */
    .product-preview-frame {
      position: relative;
      height: 440px;
      padding: 0;
      overflow: hidden;
    }
    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: contrast(1.1) brightness(0.85);
    }
    .preview-floating-card {
      position: absolute;
      bottom: 24px;
      left: 24px;
      right: 24px;
      background: rgba(11, 16, 21, 0.9);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border-strong);
      border-radius: var(--r-input);
      padding: var(--s-3) var(--s-4);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .preview-tag {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--primary);
    }
    .preview-quote {
      font-size: var(--fs-xs);
      color: var(--text);
      line-height: 1.4;
    }

    /* Steps */
    .how-it-works {
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }
    .section-title {
      font-size: 2rem;
      text-align: center;
    }
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--s-4);
    }
    .step-card {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .step-num {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 800;
      color: var(--primary);
      line-height: 1;
    }
    .step-card h3 {
      font-size: var(--fs-md);
    }
    .step-card p {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Footer */
    .landing-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--s-5) 0;
      border-top: 1px solid var(--border);
      font-size: var(--fs-xs);
      color: var(--text-faint);
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
    }

    @media (max-width: 900px) {
      .hero-section {
        grid-template-columns: 1fr;
      }
      .steps-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 600px) {
      .steps-grid {
        grid-template-columns: 1fr;
      }
      .landing-nav {
        flex-direction: column;
        height: auto;
        padding: var(--s-3) 0;
        gap: var(--s-3);
      }
    }
  `]
})
export class LandingComponent {}

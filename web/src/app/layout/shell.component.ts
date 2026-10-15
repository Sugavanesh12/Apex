import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { CopilotPanelComponent } from './copilot-panel/copilot-panel.component';
import { BottomNavComponent } from './bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, CopilotPanelComponent, BottomNavComponent],
  template: `
    <div class="app-layout">
      <!-- Desktop/Tablet Sidebar -->
      <app-sidebar class="layout-sidebar" />

      <!-- Main App Canvas -->
      <div class="layout-main">
        <app-topbar />
        <main class="page-content" id="main-content">
          <router-outlet />
        </main>
      </div>

      <!-- AI Copilot Rail -->
      <app-copilot-panel />

      <!-- Mobile Bottom Navigation -->
      <app-bottom-nav />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
    .app-layout {
      display: flex;
      height: 100vh;
      width: 100vw;
      background: var(--bg);
      position: relative;
      overflow: hidden;
    }
    .layout-sidebar {
      flex-shrink: 0;
      height: 100%;
      z-index: 20;
    }
    .layout-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-width: 0;
      overflow: hidden;
      position: relative;
    }
    .page-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: var(--s-5);
      position: relative;
    }

    @media (max-width: 600px) {
      .layout-sidebar {
        display: none;
      }
      .page-content {
        padding: var(--s-4) var(--s-3) calc(var(--tabbar-h) + var(--s-3));
      }
    }
  `]
})
export class ShellComponent {}

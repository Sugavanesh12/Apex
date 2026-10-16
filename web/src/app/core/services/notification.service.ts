import { Injectable, computed, signal } from '@angular/core';

export interface ApexNotification {
  id: string;
  type: 'workout' | 'nutrition' | 'recovery' | 'achievement' | 'system';
  title: string;
  message: string;
  timestamp: string;
  icon: string;
  read: boolean;
  link?: string;
}

const STORAGE_NOTIFS_KEY = 'apex_user_notifications_v1';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly isNotificationOpen = signal<boolean>(false);
  readonly notifications = signal<ApexNotification[]>(this.loadNotifications());

  readonly unreadCount = computed(() => {
    return this.notifications().filter(n => !n.read).length;
  });

  private loadNotifications(): ApexNotification[] {
    try {
      const stored = localStorage.getItem(STORAGE_NOTIFS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading stored notifications:', e);
    }

    // Default dynamic notifications tailored for the athlete
    return [
      {
        id: 'notif-1',
        type: 'achievement',
        title: 'Accolade Unlocked: Titan Level 14',
        message: 'Congratulations! You reached Level 14 with 142,500 kg lifetime volume.',
        timestamp: '15m ago',
        icon: '🏆',
        read: false,
        link: '/training'
      },
      {
        id: 'notif-2',
        type: 'workout',
        title: 'Prescribed Session Ready',
        message: 'Lower Body Strength is loaded on your training plan. 4 movements prescribed.',
        timestamp: '1h ago',
        icon: '⚡',
        read: false,
        link: '/training/session/live'
      },
      {
        id: 'notif-3',
        type: 'nutrition',
        title: 'Macronutrient Pacing Alert',
        message: 'You have logged 142g of 180g target protein today. 38g remaining.',
        timestamp: '2h ago',
        icon: '🥑',
        read: false,
        link: '/nutrition'
      },
      {
        id: 'notif-4',
        type: 'recovery',
        title: 'CNS Readiness Peak: 88%',
        message: 'Your HRV (82ms) and 7h 45m sleep place you in the optimal training window today.',
        timestamp: '4h ago',
        icon: '💤',
        read: true,
        link: '/recovery'
      },
      {
        id: 'notif-5',
        type: 'system',
        title: 'Neural Vision Engine Updated',
        message: 'Multimodal meal scanner now supports 12 multi-spectral profiles with auto-correction.',
        timestamp: 'Yesterday',
        icon: '✨',
        read: true,
        link: '/nutrition/scan'
      }
    ];
  }

  private saveNotifications(list: ApexNotification[]) {
    this.notifications.set(list);
    try {
      localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Error persisting notifications:', e);
    }
  }

  toggleOpen() {
    this.isNotificationOpen.update(v => !v);
  }

  close() {
    this.isNotificationOpen.set(false);
  }

  open() {
    this.isNotificationOpen.set(true);
  }

  markAsRead(id: string) {
    const updated = this.notifications().map(n => n.id === id ? { ...n, read: true } : n);
    this.saveNotifications(updated);
  }

  markAllAsRead() {
    const updated = this.notifications().map(n => ({ ...n, read: true }));
    this.saveNotifications(updated);
  }

  clearAll() {
    this.saveNotifications([]);
  }

  addNotification(item: Omit<ApexNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotif: ApexNotification = {
      ...item,
      id: 'notif-' + Date.now(),
      timestamp: 'Just now',
      read: false
    };
    const updated = [newNotif, ...this.notifications()];
    this.saveNotifications(updated);

    // If native Notification API is supported and permitted, trigger a native push alert
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(item.title, {
          body: item.message,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.warn('Native notification failed:', e);
      }
    }
  }

  async requestBrowserPush(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        new Notification('APEX Notifications Active', {
          body: 'You will receive real-time alerts for workouts, rest timers, and nutrition goals.',
          icon: '/favicon.ico'
        });
        return true;
      }
    } catch (e) {
      console.warn('Could not request notification permission:', e);
    }
    return false;
  }
}

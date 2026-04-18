import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from '../types';

const STORAGE_KEY = '@officedays_notification_prefs';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export class NotificationService {
    static async requestPermissions(): Promise<boolean> {
        const { status: existing } = await Notifications.getPermissionsAsync();
        if (existing === 'granted') return true;

        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    }

    static async hasPermissions(): Promise<boolean> {
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
    }

    static async getPreferences(): Promise<NotificationPreferences> {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(stored) };
            }
        } catch {
            // Fall through to default
        }
        return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }

    static async savePreferences(prefs: NotificationPreferences): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        if (prefs.enabled) {
            await this.scheduleReminders(prefs);
        } else {
            await this.cancelAllReminders();
        }
    }

    static async scheduleReminders(prefs: NotificationPreferences): Promise<string[]> {
        await this.cancelAllReminders();

        const ids: string[] = [];
        for (const weekday of prefs.days) {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Office Days',
                    body: "Don't forget to log your office day!",
                    data: { type: 'office-reminder' },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                    weekday,
                    hour: prefs.hour,
                    minute: prefs.minute,
                },
            });
            ids.push(id);
        }
        return ids;
    }

    static async cancelAllReminders(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    static formatTime(hour: number, minute: number): string {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');
        return `${displayHour}:${displayMinute} ${period}`;
    }
}

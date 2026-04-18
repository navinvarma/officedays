import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '../../services/NotificationService';
import { NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from '../../types';

describe('NotificationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    });

    describe('requestPermissions', () => {
        it('should return true if already granted', async () => {
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });

            const result = await NotificationService.requestPermissions();

            expect(result).toBe(true);
            expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
        });

        it('should request permissions if not already granted', async () => {
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'undetermined',
            });
            (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });

            const result = await NotificationService.requestPermissions();

            expect(result).toBe(true);
            expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
        });

        it('should return false if permissions denied', async () => {
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'undetermined',
            });
            (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });

            const result = await NotificationService.requestPermissions();

            expect(result).toBe(false);
        });
    });

    describe('hasPermissions', () => {
        it('should return true when granted', async () => {
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });

            const result = await NotificationService.hasPermissions();
            expect(result).toBe(true);
        });

        it('should return false when denied', async () => {
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });

            const result = await NotificationService.hasPermissions();
            expect(result).toBe(false);
        });
    });

    describe('getPreferences', () => {
        it('should return defaults when nothing stored', async () => {
            const prefs = await NotificationService.getPreferences();

            expect(prefs).toEqual(DEFAULT_NOTIFICATION_PREFERENCES);
        });

        it('should return stored preferences', async () => {
            const stored: NotificationPreferences = {
                enabled: true,
                hour: 9,
                minute: 30,
                days: [2, 3, 4],
            };
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stored));

            const prefs = await NotificationService.getPreferences();

            expect(prefs).toEqual(stored);
        });

        it('should merge partial stored values with defaults', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
                JSON.stringify({ enabled: true })
            );

            const prefs = await NotificationService.getPreferences();

            expect(prefs.enabled).toBe(true);
            expect(prefs.hour).toBe(DEFAULT_NOTIFICATION_PREFERENCES.hour);
            expect(prefs.minute).toBe(DEFAULT_NOTIFICATION_PREFERENCES.minute);
            expect(prefs.days).toEqual(DEFAULT_NOTIFICATION_PREFERENCES.days);
        });

        it('should return defaults on storage error', async () => {
            (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('storage error'));

            const prefs = await NotificationService.getPreferences();

            expect(prefs).toEqual(DEFAULT_NOTIFICATION_PREFERENCES);
        });
    });

    describe('savePreferences', () => {
        it('should persist to AsyncStorage and schedule when enabled', async () => {
            const prefs: NotificationPreferences = {
                enabled: true,
                hour: 17,
                minute: 0,
                days: [2, 3],
            };

            await NotificationService.savePreferences(prefs);

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@officedays_notification_prefs',
                JSON.stringify(prefs)
            );
            expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
            expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
        });

        it('should cancel all reminders when disabled', async () => {
            const prefs: NotificationPreferences = {
                enabled: false,
                hour: 17,
                minute: 0,
                days: [2, 3, 4, 5, 6],
            };

            await NotificationService.savePreferences(prefs);

            expect(AsyncStorage.setItem).toHaveBeenCalled();
            expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
            expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
        });
    });

    describe('scheduleReminders', () => {
        it('should cancel existing and schedule one per day', async () => {
            const prefs: NotificationPreferences = {
                enabled: true,
                hour: 9,
                minute: 15,
                days: [2, 4, 6],
            };

            const ids = await NotificationService.scheduleReminders(prefs);

            expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
            expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
            expect(ids).toHaveLength(3);

            const firstCall = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
            expect(firstCall.content.title).toBe('Office Days');
            expect(firstCall.trigger.weekday).toBe(2);
            expect(firstCall.trigger.hour).toBe(9);
            expect(firstCall.trigger.minute).toBe(15);
            expect(firstCall.trigger.type).toBe('weekly');
        });

        it('should return empty array for no days', async () => {
            const prefs: NotificationPreferences = {
                enabled: true,
                hour: 9,
                minute: 0,
                days: [],
            };

            const ids = await NotificationService.scheduleReminders(prefs);

            expect(ids).toHaveLength(0);
            expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
        });
    });

    describe('cancelAllReminders', () => {
        it('should cancel all scheduled notifications', async () => {
            await NotificationService.cancelAllReminders();

            expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
        });
    });

    describe('formatTime', () => {
        it('should format morning times', () => {
            expect(NotificationService.formatTime(9, 0)).toBe('9:00 AM');
            expect(NotificationService.formatTime(9, 30)).toBe('9:30 AM');
        });

        it('should format afternoon times', () => {
            expect(NotificationService.formatTime(17, 0)).toBe('5:00 PM');
            expect(NotificationService.formatTime(13, 15)).toBe('1:15 PM');
        });

        it('should format noon', () => {
            expect(NotificationService.formatTime(12, 0)).toBe('12:00 PM');
        });

        it('should format midnight', () => {
            expect(NotificationService.formatTime(0, 0)).toBe('12:00 AM');
        });

        it('should pad single-digit minutes', () => {
            expect(NotificationService.formatTime(8, 5)).toBe('8:05 AM');
        });
    });
});

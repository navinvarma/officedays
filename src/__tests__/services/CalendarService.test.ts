import { CalendarService } from '../../services/CalendarService';
import * as Calendar from 'expo-calendar';

// Mock expo-calendar
jest.mock('expo-calendar', () => ({
    getCalendarsAsync: jest.fn(),
    createEventAsync: jest.fn(),
    getEventsAsync: jest.fn(),
    getCalendarPermissionsAsync: jest.fn(),
    EntityTypes: {
        EVENT: 'event'
    },
    Availability: {
        BUSY: 'busy'
    }
}));

describe('CalendarService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset the static state
        (CalendarService as any).defaultCalendarId = null;
    });

    describe('initialize', () => {
        it('should initialize with primary calendar', async () => {
            const mockCalendars = [
                { id: 'cal1', isPrimary: false, title: 'Calendar 1' },
                { id: 'cal2', isPrimary: true, title: 'Primary Calendar' },
                { id: 'cal3', isPrimary: false, title: 'Calendar 3' }
            ];

            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue(mockCalendars);

            await CalendarService.initialize();

            expect(Calendar.getCalendarsAsync).toHaveBeenCalledWith(Calendar.EntityTypes.EVENT);
            expect(CalendarService.getDefaultCalendarId()).toBe('cal2');
        });

        it('should fallback to first calendar if no primary calendar exists', async () => {
            const mockCalendars = [
                { id: 'cal1', isPrimary: false, title: 'Calendar 1' },
                { id: 'cal2', isPrimary: false, title: 'Calendar 2' }
            ];

            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue(mockCalendars);

            await CalendarService.initialize();

            expect(CalendarService.getDefaultCalendarId()).toBe('cal1');
        });

        it('should handle case when no calendars are available', async () => {
            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue([]);

            await CalendarService.initialize();

            expect(CalendarService.getDefaultCalendarId()).toBeNull();
        });

        it('should throw error when calendar initialization fails', async () => {
            (Calendar.getCalendarsAsync as jest.Mock).mockRejectedValue(new Error('Calendar access denied'));

            await expect(CalendarService.initialize()).rejects.toThrow('Failed to initialize calendar service');
        });
    });

    describe('logOfficeDay', () => {
        it('should log office day successfully', async () => {
            const mockCalendars = [{ id: 'cal1', isPrimary: true, title: 'Primary Calendar' }];
            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue(mockCalendars);
            (Calendar.createEventAsync as jest.Mock).mockResolvedValue('event-id');

            await CalendarService.logOfficeDay();

            expect(Calendar.createEventAsync).toHaveBeenCalledWith('cal1', {
                title: 'Office Day',
                startDate: expect.any(Date),
                endDate: expect.any(Date),
                allDay: true,
                timeZone: 'UTC',
                location: 'Office',
                notes: 'Logged via Office Days app',
                alarms: [],
                recurrenceRule: undefined,
                availability: Calendar.Availability.BUSY,
            });
        });

        it('should initialize calendar if not already initialized', async () => {
            const mockCalendars = [{ id: 'cal1', isPrimary: true, title: 'Primary Calendar' }];
            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue(mockCalendars);
            (Calendar.createEventAsync as jest.Mock).mockResolvedValue('event-id');

            await CalendarService.logOfficeDay();

            expect(Calendar.getCalendarsAsync).toHaveBeenCalled();
            expect(Calendar.createEventAsync).toHaveBeenCalled();
        });

        it('should throw error if no calendar is available', async () => {
            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue([]);

            await expect(CalendarService.logOfficeDay()).rejects.toThrow('No calendar available');
        });

        it('should handle event creation failure', async () => {
            const mockCalendars = [{ id: 'cal1', isPrimary: true, title: 'Primary Calendar' }];
            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue(mockCalendars);
            (Calendar.createEventAsync as jest.Mock).mockRejectedValue(new Error('Event creation failed'));

            await expect(CalendarService.logOfficeDay()).rejects.toThrow('Failed to log office day to calendar');
        });
    });

    describe('hasOfficeDayToday', () => {
        it('should return true if office day event exists for today', async () => {
            const mockCalendars = [{ id: 'cal1', isPrimary: true, title: 'Primary Calendar' }];
            const mockEvents = [
                {
                    id: 'event1',
                    title: 'Office Day',
                    allDay: true,
                    startDate: new Date('2025-08-15T00:00:00Z'),
                    endDate: new Date('2025-08-16T00:00:00Z')
                }
            ];

            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue(mockCalendars);
            (Calendar.getEventsAsync as jest.Mock).mockResolvedValue(mockEvents);

            const result = await CalendarService.hasOfficeDayToday();

            expect(result).toBe(true);
            expect(Calendar.getEventsAsync).toHaveBeenCalledWith(
                ['cal1'],
                expect.any(Date),
                expect.any(Date)
            );
        });

        it('should return false if no office day event exists for today', async () => {
            const mockCalendars = [{ id: 'cal1', isPrimary: true, title: 'Primary Calendar' }];
            const mockEvents = [
                {
                    id: 'event1',
                    title: 'Meeting',
                    allDay: false,
                    startDate: new Date('2025-08-15T10:00:00Z'),
                    endDate: new Date('2025-08-15T11:00:00Z')
                }
            ];

            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue(mockCalendars);
            (Calendar.getEventsAsync as jest.Mock).mockResolvedValue(mockEvents);

            const result = await CalendarService.hasOfficeDayToday();

            expect(result).toBe(false);
        });

        it('should return false if calendar is not initialized', async () => {
            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue([]);

            const result = await CalendarService.hasOfficeDayToday();

            expect(result).toBe(false);
        });

        it('should handle errors gracefully and return false', async () => {
            const mockCalendars = [{ id: 'cal1', isPrimary: true, title: 'Primary Calendar' }];
            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue(mockCalendars);
            (Calendar.getEventsAsync as jest.Mock).mockRejectedValue(new Error('Events fetch failed'));

            const result = await CalendarService.hasOfficeDayToday();

            expect(result).toBe(false);
        });

        it('should only match all-day Office Day events', async () => {
            const mockCalendars = [{ id: 'cal1', isPrimary: true, title: 'Primary Calendar' }];
            const mockEvents = [
                {
                    id: 'event1',
                    title: 'Office Day',
                    allDay: false, // Not all-day
                    startDate: new Date('2025-08-15T09:00:00Z'),
                    endDate: new Date('2025-08-15T17:00:00Z')
                },
                {
                    id: 'event2',
                    title: 'Office Meeting',
                    allDay: true, // Wrong title
                    startDate: new Date('2025-08-15T00:00:00Z'),
                    endDate: new Date('2025-08-16T00:00:00Z')
                }
            ];

            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue(mockCalendars);
            (Calendar.getEventsAsync as jest.Mock).mockResolvedValue(mockEvents);

            const result = await CalendarService.hasOfficeDayToday();

            expect(result).toBe(false);
        });
    });

    describe('getDefaultCalendarId', () => {
        it('should return the default calendar ID when set', async () => {
            const mockCalendars = [{ id: 'cal1', isPrimary: true, title: 'Primary Calendar' }];
            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue(mockCalendars);

            await CalendarService.initialize();
            const calendarId = CalendarService.getDefaultCalendarId();

            expect(calendarId).toBe('cal1');
        });

        it('should return null when no calendar is set', () => {
            const calendarId = CalendarService.getDefaultCalendarId();
            expect(calendarId).toBeNull();
        });
    });

    describe('hasPermissions', () => {
        it('should return true when calendar permissions are granted', async () => {
            (Calendar.getCalendarPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

            const result = await CalendarService.hasPermissions();

            expect(result).toBe(true);
            expect(Calendar.getCalendarPermissionsAsync).toHaveBeenCalled();
        });

        it('should return false when calendar permissions are denied', async () => {
            (Calendar.getCalendarPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

            const result = await CalendarService.hasPermissions();

            expect(result).toBe(false);
        });

        it('should return false when permission check fails', async () => {
            (Calendar.getCalendarPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Permission check failed'));

            const result = await CalendarService.hasPermissions();

            expect(result).toBe(false);
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle multiple initialization calls gracefully', async () => {
            const mockCalendars = [{ id: 'cal1', isPrimary: true, title: 'Primary Calendar' }];
            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue(mockCalendars);

            await CalendarService.initialize();
            await CalendarService.initialize();

            expect(Calendar.getCalendarsAsync).toHaveBeenCalledTimes(2);
            expect(CalendarService.getDefaultCalendarId()).toBe('cal1');
        });

        it('should use UTC timezone and all-day events for office day logging', async () => {
            const mockCalendars = [{ id: 'cal1', isPrimary: true, title: 'Primary Calendar' }];
            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue(mockCalendars);
            (Calendar.createEventAsync as jest.Mock).mockResolvedValue('event-id');

            await CalendarService.logOfficeDay();

            expect(Calendar.createEventAsync).toHaveBeenCalledWith('cal1', expect.objectContaining({
                timeZone: 'UTC',
                allDay: true,
                title: 'Office Day',
                location: 'Office',
                notes: 'Logged via Office Days app'
            }));
        });
    });
});
import * as Calendar from 'expo-calendar';

export class CalendarService {
    private static defaultCalendarId: string | null = null;

    /**
     * Initialize the calendar service and get the default calendar
     */
    static async initialize(): Promise<void> {
        try {
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(cal => cal.isPrimary);

            if (defaultCalendar) {
                this.defaultCalendarId = defaultCalendar.id;
            } else if (calendars.length > 0) {
                // Fallback to first available calendar if no primary calendar
                this.defaultCalendarId = calendars[0].id;
            }
        } catch (error) {
            console.error('Error initializing calendar service:', error);
            throw new Error('Failed to initialize calendar service');
        }
    }

    /**
     * Log an office day to the calendar
     */
    static async logOfficeDay(): Promise<void> {
        if (!this.defaultCalendarId) {
            await this.initialize();
        }

        if (!this.defaultCalendarId) {
            throw new Error('No calendar available');
        }

        try {
            const today = new Date();
            // Use UTC dates to avoid timezone issues
            const startDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
            const endDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1));

            const eventDetails = {
                title: 'Office Day',
                startDate: startDate,
                endDate: endDate,
                allDay: true,
                timeZone: 'UTC', // Use UTC to avoid timezone conversion issues
                location: 'Office',
                notes: 'Logged via Office Days app',
                alarms: [],
                recurrenceRule: undefined,
                availability: Calendar.Availability.BUSY,
            };

            await Calendar.createEventAsync(this.defaultCalendarId, eventDetails);
        } catch (error) {
            console.error('Error logging office day:', error);
            throw new Error('Failed to log office day to calendar');
        }
    }

    /**
     * Check if an office day event exists for today
     */
    static async hasOfficeDayToday(): Promise<boolean> {
        if (!this.defaultCalendarId) {
            await this.initialize();
        }

        if (!this.defaultCalendarId) {
            return false;
        }

        try {
            const today = new Date();
            // Create a date range that covers the entire day in local time
            const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

            const events = await Calendar.getEventsAsync(
                [this.defaultCalendarId],
                startDate,
                endDate
            );

            // Check if any event with "Office Day" title exists for today
            return events.some(event =>
                event.title === 'Office Day' &&
                event.allDay === true
            );
        } catch (error) {
            console.error('Error checking office day today:', error);
            return false;
        }
    }

    /**
     * Get the default calendar ID
     */
    static getDefaultCalendarId(): string | null {
        return this.defaultCalendarId;
    }

    /**
     * Check if calendar permissions are granted
     */
    static async hasPermissions(): Promise<boolean> {
        try {
            const { status } = await Calendar.getCalendarPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error checking calendar permissions:', error);
            return false;
        }
    }
}


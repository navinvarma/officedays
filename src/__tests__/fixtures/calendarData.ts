/**
 * Realistic mock calendar data mimicking what expo-calendar returns
 * from a real Android device with a local "My calendars" calendar.
 *
 * Represents a typical month of office attendance:
 * - April 2026: mix of office days and time off
 * - Each event is an all-day UTC event, as created by the app
 */

interface MockCalendarEvent {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
}

// A typical 3-week stretch: office days on weekdays, one time off day
export const APRIL_2026_OFFICE_DAYS: MockCalendarEvent[] = [
    {
        id: 'od-apr-02',
        title: 'Office Day',
        startDate: new Date('2026-04-02T00:00:00Z'), // Thu
        endDate: new Date('2026-04-03T00:00:00Z'),
    },
    {
        id: 'od-apr-06',
        title: 'Office Day',
        startDate: new Date('2026-04-06T00:00:00Z'), // Mon
        endDate: new Date('2026-04-07T00:00:00Z'),
    },
    {
        id: 'od-apr-08',
        title: 'Office Day',
        startDate: new Date('2026-04-08T00:00:00Z'), // Wed
        endDate: new Date('2026-04-09T00:00:00Z'),
    },
    {
        id: 'od-apr-10',
        title: 'Office Day',
        startDate: new Date('2026-04-10T00:00:00Z'), // Fri
        endDate: new Date('2026-04-11T00:00:00Z'),
    },
    {
        id: 'od-apr-15',
        title: 'Office Day',
        startDate: new Date('2026-04-15T00:00:00Z'), // Wed
        endDate: new Date('2026-04-16T00:00:00Z'),
    },
    {
        id: 'od-apr-16',
        title: 'Office Day',
        startDate: new Date('2026-04-16T00:00:00Z'), // Thu
        endDate: new Date('2026-04-17T00:00:00Z'),
    },
    {
        id: 'od-apr-17',
        title: 'Office Day',
        startDate: new Date('2026-04-17T00:00:00Z'), // Fri
        endDate: new Date('2026-04-18T00:00:00Z'),
    },
];

export const APRIL_2026_TIME_OFF: MockCalendarEvent[] = [
    {
        id: 'to-apr-14',
        title: 'Time Off',
        startDate: new Date('2026-04-14T00:00:00Z'), // Tue — sick day
        endDate: new Date('2026-04-15T00:00:00Z'),
    },
];

// A real duplicate: same date, two separate events (user logged twice)
export const DUPLICATE_OFFICE_DAYS: MockCalendarEvent[] = [
    {
        id: 'dup-1',
        title: 'Office Day',
        startDate: new Date('2026-04-08T00:00:00Z'),
        endDate: new Date('2026-04-09T00:00:00Z'),
    },
    {
        id: 'dup-2',
        title: 'Office Day',
        startDate: new Date('2026-04-08T00:00:00Z'),
        endDate: new Date('2026-04-09T00:00:00Z'),
    },
    {
        id: 'dup-3',
        title: 'Office Day',
        startDate: new Date('2026-04-10T00:00:00Z'),
        endDate: new Date('2026-04-11T00:00:00Z'),
    },
];

// Empty state
export const NO_EVENTS: MockCalendarEvent[] = [];

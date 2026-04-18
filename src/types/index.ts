// Calendar-related types
export interface CalendarEvent {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    allDay: boolean;
    location?: string;
    notes?: string;
}

// Enhanced statistics types
export interface PeriodStats {
    workingDays: number;
    officeDays: number;
    timeOffDays: number;
    percentage: number;
    period: string;
}

export interface QuarterConfig {
    Q1: number[]; // Array of month numbers (0-11) for Q1
    Q2: number[]; // Array of month numbers (0-11) for Q2
    Q3: number[]; // Array of month numbers (0-11) for Q3
    Q4: number[]; // Array of month numbers (0-11) for Q4
}

export interface StatisticsPeriod {
    type: 'month' | 'quarter' | 'year';
    value: string; // Month name, quarter name, or year
    startDate: Date;
    endDate: Date;
}

// Notification-related types
export interface NotificationPreferences {
    enabled: boolean;
    hour: number;
    minute: number;
    days: number[]; // 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
    enabled: false,
    hour: 17,
    minute: 0,
    days: [2, 3, 4, 5, 6], // Mon-Fri
};

export const WEEKDAY_LABELS: { value: number; short: string; long: string }[] = [
    { value: 2, short: 'Mon', long: 'Monday' },
    { value: 3, short: 'Tue', long: 'Tuesday' },
    { value: 4, short: 'Wed', long: 'Wednesday' },
    { value: 5, short: 'Thu', long: 'Thursday' },
    { value: 6, short: 'Fri', long: 'Friday' },
    { value: 7, short: 'Sat', long: 'Saturday' },
    { value: 1, short: 'Sun', long: 'Sunday' },
];

export interface NotificationData {
    type: 'office-reminder' | 'other';
    [key: string]: any;
}

export interface ReminderTime {
    hour: number;
    minute: number;
    identifier: string;
}

// App state types
export interface AppPermissions {
    calendar: boolean;
    notifications: boolean;
}

export interface OfficeDayStatus {
    isLoggedToday: boolean;
    lastLoggedDate?: Date;
}

// UI state types
export interface ButtonState {
    isLoading: boolean;
    isDisabled: boolean;
    text: string;
}


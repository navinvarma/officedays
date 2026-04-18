import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import MainScreen from '../../screens/MainScreen';
import * as Calendar from 'expo-calendar';
import { renderWithTheme } from '../testUtils';

// Mock expo-calendar
jest.mock('expo-calendar');

const mockCalendar = Calendar as jest.Mocked<typeof Calendar>;

describe('Month Statistics', () => {
    beforeEach(() => {
        // Mock calendar permissions
        mockCalendar.requestCalendarPermissionsAsync.mockResolvedValue({
            status: 'granted',
            granted: true,
            canAskAgain: true,
            expires: 'never',
        });

        // Mock getCalendarsAsync
        mockCalendar.getCalendarsAsync.mockResolvedValue([
            {
                id: 'test-calendar-id',
                name: 'Test Calendar',
                color: '#000000',
                entityType: Calendar.EntityTypes.EVENT,
                sourceId: 'test-source',
                source: { name: 'Test Source', type: 'test' },
                isPrimary: true,
                isLocalAccount: true,
                isVisible: true,
                isSynced: true,
                accessLevel: Calendar.CalendarAccessLevel.OWNER,
                ownerAccount: 'test@example.com',
                timeZone: 'UTC',
                allowedReminders: [],
                allowedAttendeeTypes: [],
                isImmutable: false,
            },
        ]);

        // Mock getEventsAsync to return no events initially
        mockCalendar.getEventsAsync.mockResolvedValue([]);
    });

    it('should count all office days including weekends in month statistics', async () => {
        // Use current month for test data to match StatisticsScreen's initial state
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        // Mock events for current month
        const mockEvents = [
            {
                id: '1',
                title: 'Office Day',
                startDate: new Date(year, month, 1),
                endDate: new Date(year, month, 2),
                allDay: true,
                timeZone: 'UTC',
            },
            {
                id: '2',
                title: 'Office Day',
                startDate: new Date(year, month, 3),
                endDate: new Date(year, month, 4),
                allDay: true,
                timeZone: 'UTC',
            },
            {
                id: '3',
                title: 'Office Day',
                startDate: new Date(year, month, 5),
                endDate: new Date(year, month, 6),
                allDay: true,
                timeZone: 'UTC',
            },
        ];

        // Mock getEventsAsync to return our test events
        mockCalendar.getEventsAsync.mockResolvedValue(mockEvents);

        const { getByText, getAllByText, getByTestId } = renderWithTheme(<MainScreen />);

        // Wait for the app to load
        await waitFor(() => {
            expect(getByTestId('header-title')).toBeTruthy();
        });

        // Open the date picker to trigger data loading
        const dateButton = getByTestId('date-picker-button');
        fireEvent.press(dateButton);

        // Wait for the date picker to open
        await waitFor(() => {
            expect(getByText('Select Date')).toBeTruthy();
        });

        // Navigate to the statistics screen
        const menuButton = getByText('menu');
        fireEvent.press(menuButton);

        // Click on View Statistics
        const statisticsButton = getByText('View Statistics');
        fireEvent.press(statisticsButton);

        // Now check the statistics on the statistics screen
        await waitFor(() => {
            expect(getByText('Office Statistics')).toBeTruthy();
            // Verify stats are displayed - multiple elements contain "Statistics"
            expect(getAllByText(/Statistics$/)).toBeTruthy();
        });

        // Check that the statistics show the correct office days count
        await waitFor(() => {
            expect(getByText('3')).toBeTruthy(); // Office days count
        });
    });

    it('should only count office days from current month in statistics', async () => {
        // Use current month for test data
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        // Previous and next month
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;

        // Mock events from different months
        const mockEvents = [
            {
                id: '1',
                title: 'Office Day',
                startDate: new Date(year, month, 1), // Current month
                endDate: new Date(year, month, 2),
                allDay: true,
                timeZone: 'UTC',
            },
            {
                id: '2',
                title: 'Office Day',
                startDate: new Date(prevYear, prevMonth, 15), // Previous month
                endDate: new Date(prevYear, prevMonth, 16),
                allDay: true,
                timeZone: 'UTC',
            },
            {
                id: '3',
                title: 'Office Day',
                startDate: new Date(nextYear, nextMonth, 10), // Next month
                endDate: new Date(nextYear, nextMonth, 11),
                allDay: true,
                timeZone: 'UTC',
            },
        ];

        // Mock getEventsAsync to return our test events
        mockCalendar.getEventsAsync.mockResolvedValue(mockEvents);

        const { getByText, getByTestId } = renderWithTheme(<MainScreen />);

        // Wait for the app to load
        await waitFor(() => {
            expect(getByTestId('header-title')).toBeTruthy();
        });

        // Open the date picker to trigger data loading
        const dateButton = getByTestId('date-picker-button');
        fireEvent.press(dateButton);

        // Wait for the date picker to open
        await waitFor(() => {
            expect(getByText('Select Date')).toBeTruthy();
        });

        // Navigate to the statistics screen
        const menuButton = getByText('menu');
        fireEvent.press(menuButton);

        // Click on View Statistics
        const statisticsButton = getByText('View Statistics');
        fireEvent.press(statisticsButton);

        // Now check the statistics on the statistics screen
        await waitFor(() => {
            expect(getByText('Office Statistics')).toBeTruthy();
        });

        // Check that only current month office days are counted
        await waitFor(() => {
            expect(getByText('1')).toBeTruthy(); // Only current month office days count
        });
    });
});

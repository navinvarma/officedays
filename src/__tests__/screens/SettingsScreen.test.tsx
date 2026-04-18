import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import SettingsScreen from '../../screens/SettingsScreen';
import { renderWithTheme } from '../testUtils';
import { NotificationService } from '../../services/NotificationService';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../../types';

jest.spyOn(NotificationService, 'getPreferences');
jest.spyOn(NotificationService, 'savePreferences');
jest.spyOn(NotificationService, 'requestPermissions');

describe('SettingsScreen', () => {
    const mockOnBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
        (NotificationService.getPreferences as jest.Mock).mockResolvedValue({
            ...DEFAULT_NOTIFICATION_PREFERENCES,
        });
        (NotificationService.savePreferences as jest.Mock).mockResolvedValue(undefined);
        (NotificationService.requestPermissions as jest.Mock).mockResolvedValue(true);
    });

    describe('Initial Render', () => {
        it('should render with header and back button', async () => {
            const { getByText } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => {
                expect(getByText('Settings')).toBeTruthy();
                expect(getByText('Back')).toBeTruthy();
            });
        });

        it('should display all three theme options', async () => {
            const { getByText } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => {
                expect(getByText('Light')).toBeTruthy();
                expect(getByText('Dark')).toBeTruthy();
                expect(getByText('Sand')).toBeTruthy();
            });
        });

        it('should display theme descriptions', async () => {
            const { getByText } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => {
                expect(getByText('Airy and luminous')).toBeTruthy();
                expect(getByText('Deep and immersive')).toBeTruthy();
                expect(getByText('Warm and grounded')).toBeTruthy();
            });
        });

        it('should show checkmark on the active theme', async () => {
            const { getByTestId, queryByTestId } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />,
                { themeId: 'light' }
            );

            await waitFor(() => {
                expect(getByTestId('checkmark-light')).toBeTruthy();
                expect(queryByTestId('checkmark-dark')).toBeNull();
                expect(queryByTestId('checkmark-sand')).toBeNull();
            });
        });

        it('should display Appearance section title', async () => {
            const { getByText } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => {
                expect(getByText('Appearance')).toBeTruthy();
            });
        });

        it('should display Reminders section title', async () => {
            const { getByText } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => {
                expect(getByText('Reminders')).toBeTruthy();
            });
        });
    });

    describe('Theme Selection', () => {
        it('should switch to dark theme when tapped', async () => {
            const { getByTestId } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />,
                { themeId: 'light' }
            );

            await waitFor(() => expect(getByTestId('theme-option-dark')).toBeTruthy());

            await act(async () => {
                fireEvent.press(getByTestId('theme-option-dark'));
            });

            expect(AsyncStorage.setItem).toHaveBeenCalledWith('@officedays_theme', 'dark');
        });

        it('should switch to sand theme when tapped', async () => {
            const { getByTestId } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />,
                { themeId: 'light' }
            );

            await waitFor(() => expect(getByTestId('theme-option-sand')).toBeTruthy());

            await act(async () => {
                fireEvent.press(getByTestId('theme-option-sand'));
            });

            expect(AsyncStorage.setItem).toHaveBeenCalledWith('@officedays_theme', 'sand');
        });

        it('should update checkmark when theme changes', async () => {
            const { getByTestId, queryByTestId } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />,
                { themeId: 'light' }
            );

            await waitFor(() => expect(getByTestId('checkmark-light')).toBeTruthy());

            await act(async () => {
                fireEvent.press(getByTestId('theme-option-dark'));
            });

            expect(getByTestId('checkmark-dark')).toBeTruthy();
            expect(queryByTestId('checkmark-light')).toBeNull();
        });
    });

    describe('Notification Preferences', () => {
        it('should show the notification toggle in off state by default', async () => {
            const { getByTestId, getByText } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => {
                expect(getByText('Daily reminder')).toBeTruthy();
                expect(getByTestId('notification-toggle')).toBeTruthy();
            });
        });

        it('should not show time/day options when disabled', async () => {
            const { queryByTestId, queryByText } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => {
                expect(queryByTestId('time-picker-button')).toBeNull();
                expect(queryByText('Remind on')).toBeNull();
            });
        });

        it('should show time and day options when enabled', async () => {
            (NotificationService.getPreferences as jest.Mock).mockResolvedValue({
                ...DEFAULT_NOTIFICATION_PREFERENCES,
                enabled: true,
            });

            const { getByTestId, getByText } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => {
                expect(getByTestId('time-picker-button')).toBeTruthy();
                expect(getByText('Remind on')).toBeTruthy();
                expect(getByText('5:00 PM')).toBeTruthy();
            });
        });

        it('should request permissions and enable when toggle turned on', async () => {
            const { getByTestId } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => expect(getByTestId('notification-toggle')).toBeTruthy());

            await act(async () => {
                fireEvent(getByTestId('notification-toggle'), 'valueChange', true);
            });

            expect(NotificationService.requestPermissions).toHaveBeenCalled();
            expect(NotificationService.savePreferences).toHaveBeenCalledWith(
                expect.objectContaining({ enabled: true })
            );
        });

        it('should not enable if permissions denied', async () => {
            (NotificationService.requestPermissions as jest.Mock).mockResolvedValue(false);

            const { getByTestId } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => expect(getByTestId('notification-toggle')).toBeTruthy());

            await act(async () => {
                fireEvent(getByTestId('notification-toggle'), 'valueChange', true);
            });

            expect(NotificationService.savePreferences).not.toHaveBeenCalled();
        });

        it('should disable and save when toggle turned off', async () => {
            (NotificationService.getPreferences as jest.Mock).mockResolvedValue({
                ...DEFAULT_NOTIFICATION_PREFERENCES,
                enabled: true,
            });

            const { getByTestId } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => expect(getByTestId('notification-toggle')).toBeTruthy());

            await act(async () => {
                fireEvent(getByTestId('notification-toggle'), 'valueChange', false);
            });

            expect(NotificationService.savePreferences).toHaveBeenCalledWith(
                expect.objectContaining({ enabled: false })
            );
        });

        it('should show day toggles with Mon-Fri active by default', async () => {
            (NotificationService.getPreferences as jest.Mock).mockResolvedValue({
                ...DEFAULT_NOTIFICATION_PREFERENCES,
                enabled: true,
            });

            const { getByTestId } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => {
                expect(getByTestId('day-toggle-Mon')).toBeTruthy();
                expect(getByTestId('day-toggle-Fri')).toBeTruthy();
                expect(getByTestId('day-toggle-Sat')).toBeTruthy();
                expect(getByTestId('day-toggle-Sun')).toBeTruthy();
            });
        });

        it('should toggle a day off when pressed', async () => {
            (NotificationService.getPreferences as jest.Mock).mockResolvedValue({
                ...DEFAULT_NOTIFICATION_PREFERENCES,
                enabled: true,
            });

            const { getByTestId } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => expect(getByTestId('day-toggle-Fri')).toBeTruthy());

            await act(async () => {
                fireEvent.press(getByTestId('day-toggle-Fri'));
            });

            expect(NotificationService.savePreferences).toHaveBeenCalledWith(
                expect.objectContaining({
                    days: expect.not.arrayContaining([6]),
                })
            );
        });

        it('should open time picker when time button is pressed', async () => {
            (NotificationService.getPreferences as jest.Mock).mockResolvedValue({
                ...DEFAULT_NOTIFICATION_PREFERENCES,
                enabled: true,
            });

            const { getByTestId, queryByTestId } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => expect(getByTestId('time-picker-button')).toBeTruthy());

            expect(queryByTestId('time-picker-grid')).toBeNull();

            await act(async () => {
                fireEvent.press(getByTestId('time-picker-button'));
            });

            expect(getByTestId('time-picker-grid')).toBeTruthy();
        });

        it('should update hour when hour pill is pressed', async () => {
            (NotificationService.getPreferences as jest.Mock).mockResolvedValue({
                ...DEFAULT_NOTIFICATION_PREFERENCES,
                enabled: true,
            });

            const { getByTestId } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => expect(getByTestId('time-picker-button')).toBeTruthy());

            await act(async () => {
                fireEvent.press(getByTestId('time-picker-button'));
            });

            await act(async () => {
                fireEvent.press(getByTestId('hour-9'));
            });

            expect(NotificationService.savePreferences).toHaveBeenCalledWith(
                expect.objectContaining({ hour: 9, minute: 0 })
            );
        });

        it('should update minute when minute pill is pressed', async () => {
            (NotificationService.getPreferences as jest.Mock).mockResolvedValue({
                ...DEFAULT_NOTIFICATION_PREFERENCES,
                enabled: true,
            });

            const { getByTestId } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => expect(getByTestId('time-picker-button')).toBeTruthy());

            await act(async () => {
                fireEvent.press(getByTestId('time-picker-button'));
            });

            await act(async () => {
                fireEvent.press(getByTestId('minute-30'));
            });

            expect(NotificationService.savePreferences).toHaveBeenCalledWith(
                expect.objectContaining({ hour: 17, minute: 30 })
            );
        });

        it('should load stored preferences on mount', async () => {
            const customPrefs = {
                enabled: true,
                hour: 8,
                minute: 45,
                days: [2, 4],
            };
            (NotificationService.getPreferences as jest.Mock).mockResolvedValue(customPrefs);

            const { getByText } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => {
                expect(getByText('8:45 AM')).toBeTruthy();
            });
        });
    });

    describe('Navigation', () => {
        it('should call onBack when back button is pressed', async () => {
            const { getByText } = renderWithTheme(
                <SettingsScreen onBack={mockOnBack} />
            );

            await waitFor(() => expect(getByText('Back')).toBeTruthy());

            fireEvent.press(getByText('Back'));

            expect(mockOnBack).toHaveBeenCalledTimes(1);
        });
    });
});

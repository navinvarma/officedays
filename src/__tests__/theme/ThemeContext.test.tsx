import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../../theme/ThemeContext';

function ThemeConsumer() {
    const { theme, themeId, setThemeId, isLoading } = useTheme();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    return (
        <>
            <Text testID="theme-id">{themeId}</Text>
            <Text testID="theme-name">{theme.name}</Text>
            <Text testID="bg-color">{theme.colors.background}</Text>
            <TouchableOpacity testID="set-dark" onPress={() => setThemeId('dark')}>
                <Text>Dark</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="set-sand" onPress={() => setThemeId('sand')}>
                <Text>Sand</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="set-light" onPress={() => setThemeId('light')}>
                <Text>Light</Text>
            </TouchableOpacity>
        </>
    );
}

describe('ThemeContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    });

    describe('ThemeProvider', () => {
        it('should provide light theme by default', async () => {
            const { getByTestId } = render(
                <ThemeProvider>
                    <ThemeConsumer />
                </ThemeProvider>
            );

            await waitFor(() => {
                expect(getByTestId('theme-id').props.children).toBe('light');
            });
        });

        it('should accept initialThemeId prop', () => {
            const { getByTestId } = render(
                <ThemeProvider initialThemeId="dark">
                    <ThemeConsumer />
                </ThemeProvider>
            );

            expect(getByTestId('theme-id').props.children).toBe('dark');
            expect(getByTestId('theme-name').props.children).toBe('Dark');
        });

        it('should skip AsyncStorage load when initialThemeId is provided', () => {
            render(
                <ThemeProvider initialThemeId="sand">
                    <ThemeConsumer />
                </ThemeProvider>
            );

            expect(AsyncStorage.getItem).not.toHaveBeenCalled();
        });

        it('should load persisted theme from AsyncStorage', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

            const { getByTestId } = render(
                <ThemeProvider>
                    <ThemeConsumer />
                </ThemeProvider>
            );

            await waitFor(() => {
                expect(getByTestId('theme-id').props.children).toBe('dark');
            });

            expect(AsyncStorage.getItem).toHaveBeenCalledWith('@officedays_theme');
        });

        it('should fall back to light theme on invalid stored value', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-theme');

            const { getByTestId } = render(
                <ThemeProvider>
                    <ThemeConsumer />
                </ThemeProvider>
            );

            await waitFor(() => {
                expect(getByTestId('theme-id').props.children).toBe('light');
            });
        });

        it('should handle AsyncStorage errors gracefully', async () => {
            (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

            const { getByTestId } = render(
                <ThemeProvider>
                    <ThemeConsumer />
                </ThemeProvider>
            );

            await waitFor(() => {
                expect(getByTestId('theme-id').props.children).toBe('light');
            });
        });
    });

    describe('setThemeId', () => {
        it('should update theme when setThemeId is called', async () => {
            const { getByTestId } = render(
                <ThemeProvider initialThemeId="light">
                    <ThemeConsumer />
                </ThemeProvider>
            );

            expect(getByTestId('theme-id').props.children).toBe('light');

            await act(async () => {
                fireEvent.press(getByTestId('set-dark'));
            });

            expect(getByTestId('theme-id').props.children).toBe('dark');
        });

        it('should persist theme change to AsyncStorage', async () => {
            const { getByTestId } = render(
                <ThemeProvider initialThemeId="light">
                    <ThemeConsumer />
                </ThemeProvider>
            );

            await act(async () => {
                fireEvent.press(getByTestId('set-sand'));
            });

            expect(AsyncStorage.setItem).toHaveBeenCalledWith('@officedays_theme', 'sand');
        });

        it('should update theme colors when switching themes', async () => {
            const { getByTestId } = render(
                <ThemeProvider initialThemeId="light">
                    <ThemeConsumer />
                </ThemeProvider>
            );

            expect(getByTestId('bg-color').props.children).toBe('#E8EEFF');

            await act(async () => {
                fireEvent.press(getByTestId('set-dark'));
            });

            expect(getByTestId('bg-color').props.children).toBe('#0F0B2E');

            await act(async () => {
                fireEvent.press(getByTestId('set-sand'));
            });

            expect(getByTestId('bg-color').props.children).toBe('#FEF3E2');
        });
    });

    describe('useTheme hook', () => {
        it('should return theme object with all required properties', () => {
            const { getByTestId } = render(
                <ThemeProvider initialThemeId="light">
                    <ThemeConsumer />
                </ThemeProvider>
            );

            expect(getByTestId('theme-id')).toBeTruthy();
            expect(getByTestId('theme-name')).toBeTruthy();
            expect(getByTestId('bg-color')).toBeTruthy();
        });
    });
});

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeId } from './types';
import { themes, lightTheme } from './themes';

const THEME_STORAGE_KEY = '@officedays_theme';

interface ThemeContextValue {
    theme: Theme;
    themeId: ThemeId;
    setThemeId: (id: ThemeId) => void;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: lightTheme,
    themeId: 'light',
    setThemeId: () => {},
    isLoading: true,
});

interface ThemeProviderProps {
    children: React.ReactNode;
    initialThemeId?: ThemeId;
}

export function ThemeProvider({ children, initialThemeId }: ThemeProviderProps) {
    const [themeId, setThemeIdState] = useState<ThemeId>(initialThemeId || 'light');
    const [isLoading, setIsLoading] = useState(!initialThemeId);

    useEffect(() => {
        if (initialThemeId) return;

        const loadTheme = async () => {
            try {
                const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (stored && (stored === 'light' || stored === 'dark' || stored === 'sand')) {
                    setThemeIdState(stored as ThemeId);
                }
            } catch {
                // Use default light theme on error
            } finally {
                setIsLoading(false);
            }
        };

        loadTheme();
    }, [initialThemeId]);

    const setThemeId = useCallback(async (id: ThemeId) => {
        setThemeIdState(id);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, id);
        } catch {
            // Silently fail on storage error
        }
    }, []);

    const theme = themes[themeId] || lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, themeId, setThemeId, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

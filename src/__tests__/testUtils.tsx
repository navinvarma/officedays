import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../theme';
import { ThemeId } from '../theme';

interface RenderWithThemeOptions extends Omit<RenderOptions, 'wrapper'> {
    themeId?: ThemeId;
}

export function renderWithTheme(
    ui: React.ReactElement,
    options?: RenderWithThemeOptions
) {
    const { themeId = 'light', ...renderOptions } = options || {};

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <ThemeProvider initialThemeId={themeId}>
                {children}
            </ThemeProvider>
        );
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

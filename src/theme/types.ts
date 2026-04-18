export type ThemeId = 'light' | 'dark' | 'sand';

export interface ThemeColors {
    // Backgrounds
    background: string;
    surface: string;
    surfaceSecondary: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;

    // Brand
    primary: string;
    primaryMuted: string;
    accent: string;

    // Borders
    border: string;
    borderLight: string;

    // Status
    success: string;
    successMuted: string;
    danger: string;
    dangerMuted: string;
    warning: string;
    warningMuted: string;

    // Calendar
    calendarToday: string;
    calendarOfficeDay: string;
    calendarTimeOff: string;
    calendarSelected: string;

    // Overlay
    overlay: string;

    // Disabled
    disabled: string;
    disabledText: string;
}

export interface ThemeSpacing {
    xs: number;   // 4
    sm: number;   // 8
    md: number;   // 12
    lg: number;   // 16
    xl: number;   // 20
    xxl: number;  // 24
    xxxl: number; // 32
}

export interface ThemeTypography {
    sizes: {
        caption: number;   // 11
        footnote: number;  // 13
        body: number;      // 15
        callout: number;   // 16
        headline: number;  // 17
        title3: number;    // 20
        title2: number;    // 22
        title1: number;    // 26
    };
    weights: {
        regular: string;
        medium: string;
        semibold: string;
        bold: string;
    };
    lineHeights: {
        tight: number;    // 1.2
        normal: number;   // 1.4
        relaxed: number;  // 1.6
    };
    letterSpacing: {
        tight: number;    // -0.4
        normal: number;   // 0
        wide: number;     // 0.4
    };
}

export interface ThemeBorderRadius {
    xs: number;   // 4
    sm: number;   // 6
    md: number;   // 8
    lg: number;   // 10
    xl: number;   // 12
    pill: number; // 999
}

export interface ThemeGradient {
    colors: string[];
    start: { x: number; y: number };
    end: { x: number; y: number };
}

export interface ThemeGlassSurface {
    background: string;
    borderColor: string;
    borderWidth: number;
}

export interface ThemeGlass {
    surface: ThemeGlassSurface;
    surfaceSecondary: ThemeGlassSurface;
    modal: ThemeGlassSurface;
}

export interface ThemeFonts {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
}

export interface ThemeShadow {
    none: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    sm: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    md: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    lg: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
}

export interface Theme {
    id: ThemeId;
    name: string;
    colors: ThemeColors;
    spacing: ThemeSpacing;
    typography: ThemeTypography;
    borderRadius: ThemeBorderRadius;
    shadow: ThemeShadow;
    gradient: ThemeGradient;
    glass: ThemeGlass;
    fonts: ThemeFonts;
    statusBarStyle: 'light' | 'dark' | 'auto';
}

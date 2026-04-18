import { lightTheme, darkTheme, sandTheme, themes } from '../../theme/themes';
import { Theme } from '../../theme/types';

describe('Theme Definitions', () => {
    const allThemes: Theme[] = [lightTheme, darkTheme, sandTheme];
    const themeNames = ['light', 'dark', 'sand'] as const;

    it('should export all three themes', () => {
        expect(lightTheme).toBeDefined();
        expect(darkTheme).toBeDefined();
        expect(sandTheme).toBeDefined();
    });

    it('should have a themes record with all themes', () => {
        expect(themes.light).toBe(lightTheme);
        expect(themes.dark).toBe(darkTheme);
        expect(themes.sand).toBe(sandTheme);
    });

    describe.each(themeNames)('%s theme', (themeId) => {
        const theme = themes[themeId];

        it('should have correct id and name', () => {
            expect(theme.id).toBe(themeId);
            expect(theme.name).toBeTruthy();
        });

        it('should have all required color tokens', () => {
            const requiredColors = [
                'background', 'surface', 'surfaceSecondary',
                'textPrimary', 'textSecondary', 'textTertiary', 'textInverse',
                'primary', 'primaryMuted', 'accent',
                'border', 'borderLight',
                'success', 'successMuted', 'danger', 'dangerMuted',
                'warning', 'warningMuted',
                'calendarToday', 'calendarOfficeDay', 'calendarSelected',
                'overlay', 'disabled', 'disabledText',
            ];

            requiredColors.forEach(color => {
                expect(theme.colors).toHaveProperty(color);
                expect(typeof (theme.colors as any)[color]).toBe('string');
            });
        });

        it('should have all spacing values', () => {
            expect(theme.spacing.xs).toBe(4);
            expect(theme.spacing.sm).toBe(8);
            expect(theme.spacing.md).toBe(12);
            expect(theme.spacing.lg).toBe(16);
            expect(theme.spacing.xl).toBe(20);
            expect(theme.spacing.xxl).toBe(24);
            expect(theme.spacing.xxxl).toBe(32);
        });

        it('should have all typography values', () => {
            expect(theme.typography.sizes.caption).toBe(11);
            expect(theme.typography.sizes.body).toBe(15);
            expect(theme.typography.sizes.title1).toBe(26);
            expect(theme.typography.weights.regular).toBe('400');
            expect(theme.typography.weights.bold).toBe('700');
        });

        it('should have all border radius values', () => {
            expect(theme.borderRadius.xs).toBe(6);
            expect(theme.borderRadius.pill).toBe(999);
        });

        it('should have gradient configuration', () => {
            expect(theme.gradient).toBeDefined();
            expect(theme.gradient.colors).toBeDefined();
            expect(theme.gradient.colors.length).toBeGreaterThanOrEqual(2);
            expect(theme.gradient.start).toBeDefined();
            expect(theme.gradient.end).toBeDefined();
        });

        it('should have glass surface tokens', () => {
            expect(theme.glass).toBeDefined();
            expect(theme.glass.surface).toBeDefined();
            expect(theme.glass.surface.background).toBeDefined();
            expect(theme.glass.surface.borderColor).toBeDefined();
            expect(typeof theme.glass.surface.borderWidth).toBe('number');
            expect(theme.glass.surfaceSecondary).toBeDefined();
            expect(theme.glass.modal).toBeDefined();
        });

        it('should have font family tokens', () => {
            expect(theme.fonts).toBeDefined();
            expect(theme.fonts.regular).toBeDefined();
            expect(theme.fonts.medium).toBeDefined();
            expect(theme.fonts.semibold).toBeDefined();
            expect(theme.fonts.bold).toBeDefined();
        });

        it('should have all shadow levels', () => {
            expect(theme.shadow.none).toBeDefined();
            expect(theme.shadow.sm).toBeDefined();
            expect(theme.shadow.md).toBeDefined();
            expect(theme.shadow.lg).toBeDefined();
            expect(theme.shadow.none.shadowOpacity).toBe(0);
        });

        it('should have a valid statusBarStyle', () => {
            expect(['light', 'dark', 'auto']).toContain(theme.statusBarStyle);
        });
    });

    it('should share spacing, typography, and borderRadius across themes', () => {
        expect(lightTheme.spacing).toEqual(darkTheme.spacing);
        expect(lightTheme.spacing).toEqual(sandTheme.spacing);
        expect(lightTheme.typography).toEqual(darkTheme.typography);
        expect(lightTheme.borderRadius).toEqual(darkTheme.borderRadius);
    });

    it('should have different colors for each theme', () => {
        expect(lightTheme.colors.background).not.toBe(darkTheme.colors.background);
        expect(lightTheme.colors.background).not.toBe(sandTheme.colors.background);
        expect(darkTheme.colors.background).not.toBe(sandTheme.colors.background);
    });
});

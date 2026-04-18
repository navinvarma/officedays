# Office Days - Project Guide

## Overview
React Native / Expo mobile app for tracking office attendance via calendar integration. Logs "Office Day" and "Time Off" all-day events to the device's primary calendar. Time off days are excluded from the attendance percentage denominator.

## Tech Stack
- **Runtime**: React Native 0.81.5, Expo SDK 54, React 19.1, TypeScript 5.9
- **Storage**: expo-calendar for events, @react-native-async-storage/async-storage for preferences
- **Notifications**: expo-notifications for daily reminders
- **Testing**: Jest 29, @testing-library/react-native 12, jest-expo
- **Build**: Expo EAS, Metro bundler

## Architecture
Single-screen app with **state-based navigation** (no react-navigation). `MainScreen` manages a `currentScreen` state that switches between rendering:
- `MainScreen` (main) - Calendar picker, log office day / time off buttons, menu
- `StatisticsScreen` - Period/quarter/year stats with configurable quarter definitions, time off excluded from attendance %
- `PastOfficeDaysScreen` - Combined list of office days and time off entries with delete
- `SettingsScreen` - Theme picker + notification reminders

All navigation is via `setCurrentScreen()` calls, not a router.

## File Structure
```
App.tsx                          # Root: ThemeProvider + LinearGradient wrapper
src/
  theme/
    types.ts                     # Theme type definitions (ThemeId, Theme, ThemeColors, etc.)
    themes.ts                    # 3 theme palettes: light, dark, sand
    ThemeContext.tsx              # ThemeProvider, useTheme hook, AsyncStorage persistence
    index.ts                     # Barrel export
  screens/
    MainScreen.tsx               # Main screen + navigation state management
    StatisticsScreen.tsx         # Stats dashboard with period analysis
    PastOfficeDaysScreen.tsx     # Past events list (office days + time off)
    SettingsScreen.tsx           # Theme picker + notification preferences
  services/
    StatisticsService.ts         # Pure calculation logic (working days, period stats, time off)
    CalendarService.ts           # expo-calendar API wrapper
    NotificationService.ts       # expo-notifications scheduling + preferences
  types/
    index.ts                     # Domain types (CalendarEvent, PeriodStats, QuarterConfig, NotificationPreferences)
  __tests__/
    testUtils.tsx                # renderWithTheme helper for all tests
    screens/                     # Screen component tests
    services/                    # Service unit tests
    theme/                       # Theme system tests
```

## Key Commands
```bash
npm test                    # Run all tests
npm run test:coverage       # Coverage report
npm run test:watch          # Watch mode
npx expo start              # Dev server
```

## Conventions
- **Styling**: `createStyles(theme: Theme)` factory pattern per component. Never hardcode colors.
- **Theme tokens**: Use `theme.colors.*`, `theme.spacing.*`, `theme.typography.*`, `theme.borderRadius.*`, `theme.shadow.*`
- **Font weights**: Use `theme.typography.semibold` for headers, `theme.typography.medium` for labels. Cast with `as any` for RN types.
- **Spacing**: Tight scale (4/8/12/16/20/24/32). Use `theme.spacing.lg` (16) as the primary padding.
- **Border radius**: 4-12px range. Use `theme.borderRadius.pill` (999) only for pill buttons.
- **Shadows**: Very subtle. Use `theme.shadow.sm` or `theme.shadow.md`. Max opacity 0.08 for light themes.
- **Navigation**: Add new screens by extending the `currentScreen` union type in MainScreen.
- **Tests**: Wrap all screen renders with `renderWithTheme()` from `testUtils.tsx`.
- **Calendar events**: Created as UTC all-day events. "Office Day" for attendance, "Time Off" for exclusions. Timezone handling is critical.
- **No emojis** in menu items or screen headers. Keep functional glyphs only (hamburger, close, nav arrows).
- **Attendance formula**: `officeDays / (workingDays - timeOffDays) * 100`. Time off reduces the denominator.

## Testing Notes
- expo-calendar is fully mocked in tests (jest.mock)
- AsyncStorage uses the built-in jest mock from the package
- ThemeProvider accepts `initialThemeId` prop to bypass AsyncStorage in tests
- 196 tests across services, screens, and theme system

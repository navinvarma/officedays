// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    // Uncomment to see console.log in tests
    // log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-constants
jest.mock('expo-constants', () => ({
    default: {
        expoConfig: {
            extra: {
                eas: {
                    projectId: 'test-project-id'
                }
            }
        }
    }
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
    StatusBar: 'StatusBar'
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 })
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
    enableScreens: jest.fn()
}));

// Mock expo-font
jest.mock('expo-font', () => ({
    useFonts: jest.fn(() => [true, null]),
    isLoaded: jest.fn(() => true),
    loadAsync: jest.fn(),
}));

// Mock @expo-google-fonts/plus-jakarta-sans
jest.mock('@expo-google-fonts/plus-jakarta-sans', () => ({
    useFonts: jest.fn(() => [true, null]),
    PlusJakartaSans_400Regular: 'PlusJakartaSans_400Regular',
    PlusJakartaSans_500Medium: 'PlusJakartaSans_500Medium',
    PlusJakartaSans_600SemiBold: 'PlusJakartaSans_600SemiBold',
    PlusJakartaSans_700Bold: 'PlusJakartaSans_700Bold',
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
    const { View } = require('react-native');
    return {
        LinearGradient: View,
    };
});

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
    preventAutoHideAsync: jest.fn(() => Promise.resolve()),
    hideAsync: jest.fn(() => Promise.resolve()),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    const Ionicons = ({ name, ...props }) => <Text {...props}>{name}</Text>;
    Ionicons.displayName = 'Ionicons';
    return { Ionicons };
});

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    scheduleNotificationAsync: jest.fn(() => Promise.resolve('mock-notification-id')),
    cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
    setNotificationHandler: jest.fn(),
    SchedulableTriggerInputTypes: {
        WEEKLY: 'weekly',
        DAILY: 'daily',
        DATE: 'date',
    },
}));

// React Native mocking is handled by jest-expo preset

// Mock Alert
global.Alert = {
    alert: jest.fn((title, message, buttons) => {
        // Simulate user clicking the Delete button (index 1)
        if (buttons && buttons[1] && buttons[1].onPress) {
            buttons[1].onPress();
        }
    })
};

// Global test timeout
jest.setTimeout(10000);

// Mock Date.now() for consistent testing
const mockDate = new Date('2024-01-15T12:00:00Z');
global.Date.now = jest.fn(() => mockDate.getTime());

// Mock Intl.DateTimeFormat
global.Intl = {
    ...global.Intl,
    DateTimeFormat: jest.fn(() => ({
        resolvedOptions: () => ({ timeZone: 'UTC' })
    }))
};

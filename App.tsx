import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    useFonts,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';

import { ThemeProvider, useTheme } from './src/theme';
import MainScreen from './src/screens/MainScreen';

SplashScreen.preventAutoHideAsync();

function AppContent() {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={theme.gradient.colors}
                start={theme.gradient.start}
                end={theme.gradient.end}
                style={StyleSheet.absoluteFill}
            />
            <StatusBar style={theme.statusBarStyle} />
            <MainScreen />
        </View>
    );
}

export default function App() {
    const [fontsLoaded, fontError] = useFonts({
        PlusJakartaSans_400Regular,
        PlusJakartaSans_500Medium,
        PlusJakartaSans_600SemiBold,
        PlusJakartaSans_700Bold,
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded || fontError) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <View style={styles.container} onLayout={onLayoutRootView}>
            <ThemeProvider>
                <AppContent />
            </ThemeProvider>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

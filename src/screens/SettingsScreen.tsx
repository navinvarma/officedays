import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Theme, ThemeId } from '../theme';
import { NotificationService } from '../services/NotificationService';
import {
    NotificationPreferences,
    DEFAULT_NOTIFICATION_PREFERENCES,
    WEEKDAY_LABELS,
} from '../types';

interface SettingsScreenProps {
    onBack: () => void;
}

const themeOptions: { id: ThemeId; label: string; description: string }[] = [
    { id: 'light', label: 'Light', description: 'Airy and luminous' },
    { id: 'dark', label: 'Dark', description: 'Deep and immersive' },
    { id: 'sand', label: 'Sand', description: 'Warm and grounded' },
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_OPTIONS = [0, 15, 30, 45];

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
    const { theme, themeId, setThemeId } = useTheme();
    const styles = createStyles(theme);

    const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(
        DEFAULT_NOTIFICATION_PREFERENCES
    );
    const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        NotificationService.getPreferences().then((prefs) => {
            setNotifPrefs(prefs);
            setIsLoadingPrefs(false);
        });
    }, []);

    const updatePrefs = async (patch: Partial<NotificationPreferences>) => {
        const updated = { ...notifPrefs, ...patch };
        setNotifPrefs(updated);
        try {
            await NotificationService.savePreferences(updated);
        } catch {
            Alert.alert('Error', 'Failed to save notification preferences.');
        }
    };

    const handleToggleEnabled = async (value: boolean) => {
        if (value) {
            const granted = await NotificationService.requestPermissions();
            if (!granted) {
                Alert.alert(
                    'Permissions Required',
                    'Please enable notifications in your device settings to use reminders.'
                );
                return;
            }
        }
        await updatePrefs({ enabled: value });
    };

    const toggleDay = (day: number) => {
        const current = notifPrefs.days;
        const updated = current.includes(day)
            ? current.filter((d) => d !== day)
            : [...current, day];
        if (updated.length === 0) {
            Alert.alert('Invalid', 'At least one day must be selected.');
            return;
        }
        updatePrefs({ days: updated });
    };

    const selectTime = (hour: number, minute: number) => {
        updatePrefs({ hour, minute });
        setShowTimePicker(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <View style={styles.backButtonRow}>
                        <Ionicons name="chevron-back" size={18} color={theme.colors.primary} />
                        <Text style={styles.backButtonText}>Back</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Appearance Section */}
                <Text style={styles.sectionTitle}>Appearance</Text>
                {themeOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.themeOption,
                            themeId === option.id && styles.themeOptionActive,
                        ]}
                        onPress={() => setThemeId(option.id)}
                        testID={`theme-option-${option.id}`}
                    >
                        <View style={styles.themeOptionContent}>
                            <Text style={[
                                styles.themeOptionLabel,
                                themeId === option.id && styles.themeOptionLabelActive,
                            ]}>
                                {option.label}
                            </Text>
                            <Text style={styles.themeOptionDescription}>
                                {option.description}
                            </Text>
                        </View>
                        {themeId === option.id && (
                            <Ionicons
                                name="checkmark"
                                size={theme.typography.sizes.headline}
                                color={theme.colors.primary}
                                testID={`checkmark-${option.id}`}
                            />
                        )}
                    </TouchableOpacity>
                ))}

                {/* Notifications Section */}
                <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
                    Reminders
                </Text>

                {isLoadingPrefs ? (
                    <Text style={styles.loadingText}>Loading preferences...</Text>
                ) : (
                    <>
                        {/* Enable toggle */}
                        <View style={styles.settingRow}>
                            <View style={styles.settingRowLabel}>
                                <Text style={styles.settingLabel}>Daily reminder</Text>
                                <Text style={styles.settingDescription}>
                                    Get reminded to log your office day
                                </Text>
                            </View>
                            <Switch
                                testID="notification-toggle"
                                value={notifPrefs.enabled}
                                onValueChange={handleToggleEnabled}
                                trackColor={{
                                    false: theme.colors.disabled,
                                    true: theme.colors.primary,
                                }}
                                thumbColor={theme.colors.surface}
                            />
                        </View>

                        {notifPrefs.enabled && (
                            <>
                                {/* Time picker */}
                                <View style={styles.settingRow}>
                                    <Text style={styles.settingLabel}>Reminder time</Text>
                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => setShowTimePicker(!showTimePicker)}
                                        testID="time-picker-button"
                                    >
                                        <Text style={styles.timeButtonText}>
                                            {NotificationService.formatTime(notifPrefs.hour, notifPrefs.minute)}
                                        </Text>
                                        <Ionicons
                                            name={showTimePicker ? 'chevron-up' : 'chevron-down'}
                                            size={16}
                                            color={theme.colors.primary}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {showTimePicker && (
                                    <View style={styles.timePickerContainer} testID="time-picker-grid">
                                        <Text style={styles.timePickerLabel}>Hour</Text>
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            style={styles.timePickerScroll}
                                        >
                                            {HOUR_OPTIONS.map((h) => (
                                                <TouchableOpacity
                                                    key={h}
                                                    style={[
                                                        styles.timePill,
                                                        notifPrefs.hour === h && styles.timePillActive,
                                                    ]}
                                                    onPress={() => selectTime(h, notifPrefs.minute)}
                                                    testID={`hour-${h}`}
                                                >
                                                    <Text style={[
                                                        styles.timePillText,
                                                        notifPrefs.hour === h && styles.timePillTextActive,
                                                    ]}>
                                                        {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>

                                        <Text style={styles.timePickerLabel}>Minute</Text>
                                        <View style={styles.minuteRow}>
                                            {MINUTE_OPTIONS.map((m) => (
                                                <TouchableOpacity
                                                    key={m}
                                                    style={[
                                                        styles.timePill,
                                                        notifPrefs.minute === m && styles.timePillActive,
                                                    ]}
                                                    onPress={() => selectTime(notifPrefs.hour, m)}
                                                    testID={`minute-${m}`}
                                                >
                                                    <Text style={[
                                                        styles.timePillText,
                                                        notifPrefs.minute === m && styles.timePillTextActive,
                                                    ]}>
                                                        :{m.toString().padStart(2, '0')}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Day toggles */}
                                <View style={styles.daysSection}>
                                    <Text style={styles.settingLabel}>Remind on</Text>
                                    <View style={styles.daysRow}>
                                        {WEEKDAY_LABELS.map(({ value, short }) => (
                                            <TouchableOpacity
                                                key={value}
                                                style={[
                                                    styles.dayPill,
                                                    notifPrefs.days.includes(value) && styles.dayPillActive,
                                                ]}
                                                onPress={() => toggleDay(value)}
                                                testID={`day-toggle-${short}`}
                                            >
                                                <Text style={[
                                                    styles.dayPillText,
                                                    notifPrefs.days.includes(value) && styles.dayPillTextActive,
                                                ]}>
                                                    {short}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'transparent',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 50,
            paddingBottom: theme.spacing.lg,
            paddingHorizontal: theme.spacing.lg,
            backgroundColor: theme.glass.surface.background,
            borderBottomWidth: theme.glass.surface.borderWidth,
            borderBottomColor: theme.glass.surface.borderColor,
        },
        backButton: {
            padding: theme.spacing.sm,
        },
        backButtonRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        backButtonText: {
            fontSize: theme.typography.sizes.callout,
            color: theme.colors.primary,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
        },
        title: {
            fontSize: theme.typography.sizes.title3,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
            color: theme.colors.textPrimary,
        },
        placeholder: {
            width: 50,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.xxl,
            paddingBottom: theme.spacing.xxxl,
        },
        sectionTitle: {
            fontSize: theme.typography.sizes.footnote,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
            color: theme.colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: theme.typography.letterSpacing.wide,
            marginBottom: theme.spacing.md,
        },
        sectionTitleSpaced: {
            marginTop: theme.spacing.xxxl,
        },
        themeOption: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            backgroundColor: theme.glass.surface.background,
            borderRadius: theme.borderRadius.lg,
            marginBottom: theme.spacing.sm,
            borderWidth: theme.glass.surface.borderWidth,
            borderColor: theme.glass.surface.borderColor,
        },
        themeOptionActive: {
            borderColor: theme.colors.primary,
        },
        themeOptionContent: {
            flex: 1,
        },
        themeOptionLabel: {
            fontSize: theme.typography.sizes.callout,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
            color: theme.colors.textPrimary,
            marginBottom: 2,
        },
        themeOptionLabelActive: {
            color: theme.colors.primary,
        },
        themeOptionDescription: {
            fontSize: theme.typography.sizes.footnote,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textSecondary,
        },
        loadingText: {
            fontSize: theme.typography.sizes.body,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textTertiary,
            textAlign: 'center',
            marginTop: theme.spacing.lg,
        },
        settingRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            backgroundColor: theme.glass.surface.background,
            borderRadius: theme.borderRadius.lg,
            marginBottom: theme.spacing.sm,
            borderWidth: theme.glass.surface.borderWidth,
            borderColor: theme.glass.surface.borderColor,
        },
        settingRowLabel: {
            flex: 1,
            marginRight: theme.spacing.md,
        },
        settingLabel: {
            fontSize: theme.typography.sizes.callout,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
            color: theme.colors.textPrimary,
        },
        settingDescription: {
            fontSize: theme.typography.sizes.footnote,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textSecondary,
            marginTop: 2,
        },
        timeButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
            backgroundColor: theme.glass.surfaceSecondary.background,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            borderWidth: theme.glass.surfaceSecondary.borderWidth,
            borderColor: theme.glass.surfaceSecondary.borderColor,
        },
        timeButtonText: {
            fontSize: theme.typography.sizes.callout,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
            color: theme.colors.primary,
        },
        timePickerContainer: {
            backgroundColor: theme.glass.surface.background,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.sm,
            borderWidth: theme.glass.surface.borderWidth,
            borderColor: theme.glass.surface.borderColor,
        },
        timePickerLabel: {
            fontSize: theme.typography.sizes.footnote,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.sm,
            marginTop: theme.spacing.sm,
        },
        timePickerScroll: {
            marginBottom: theme.spacing.sm,
        },
        timePill: {
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.borderRadius.pill,
            backgroundColor: theme.glass.surfaceSecondary.background,
            borderWidth: theme.glass.surfaceSecondary.borderWidth,
            borderColor: theme.glass.surfaceSecondary.borderColor,
            marginRight: theme.spacing.sm,
            minWidth: 42,
            alignItems: 'center',
        },
        timePillActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        timePillText: {
            fontSize: theme.typography.sizes.footnote,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
            color: theme.colors.textPrimary,
        },
        timePillTextActive: {
            color: theme.colors.textInverse,
        },
        minuteRow: {
            flexDirection: 'row',
        },
        daysSection: {
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            backgroundColor: theme.glass.surface.background,
            borderRadius: theme.borderRadius.lg,
            marginBottom: theme.spacing.sm,
            borderWidth: theme.glass.surface.borderWidth,
            borderColor: theme.glass.surface.borderColor,
        },
        daysRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.md,
        },
        dayPill: {
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.borderRadius.pill,
            backgroundColor: theme.glass.surfaceSecondary.background,
            borderWidth: theme.glass.surfaceSecondary.borderWidth,
            borderColor: theme.glass.surfaceSecondary.borderColor,
            minWidth: 42,
            alignItems: 'center',
        },
        dayPillActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        dayPillText: {
            fontSize: theme.typography.sizes.footnote,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
            color: theme.colors.textPrimary,
        },
        dayPillTextActive: {
            color: theme.colors.textInverse,
        },
    });

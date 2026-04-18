import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatisticsService } from '../services/StatisticsService';
import { PeriodStats, QuarterConfig } from '../types';
import { useTheme, Theme } from '../theme';

interface StatisticsState {
    selectedPeriodType: 'month' | 'quarter' | 'year';
    selectedYear: number;
    selectedMonth: number;
    selectedQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    currentStats: PeriodStats;
    availableYears: number[];
    availableMonths: number[];
}

interface StatisticsScreenProps {
    pastOfficeDays: Array<{ startDate: Date }>;
    pastTimeOffDays: Array<{ startDate: Date }>;
    onBack: () => void;
}

export default function StatisticsScreen({ pastOfficeDays, pastTimeOffDays, onBack }: StatisticsScreenProps) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const [statisticsState, setStatisticsState] = useState<StatisticsState>({
        selectedPeriodType: 'month',
        selectedYear: new Date().getFullYear(),
        selectedMonth: new Date().getMonth(),
        selectedQuarter: 'Q1',
        currentStats: { workingDays: 0, officeDays: 0, timeOffDays: 0, percentage: 0, period: '' },
        availableYears: [],
        availableMonths: []
    });

    const [quarterConfig, setQuarterConfig] = useState<QuarterConfig>(StatisticsService.getQuarterConfig());

    useEffect(() => {
        StatisticsService.loadQuarterConfig().then(config => {
            setQuarterConfig(config);
            recalculateStats();
        });
    }, []);

    useEffect(() => {
        recalculateStats();
    }, [pastOfficeDays]);

    const recalculateStats = (overrides: Partial<StatisticsState> = {}) => {
        const officeDayDates = pastOfficeDays.map(event => new Date(event.startDate));
        const timeOffDayDates = pastTimeOffDays.map(event => new Date(event.startDate));
        const availableYears = StatisticsService.getAvailableYears(officeDayDates);

        setStatisticsState(prev => {
            const merged = { ...prev, ...overrides };
            const year = overrides.selectedYear ?? (availableYears.length > 0 ? availableYears[0] : prev.selectedYear);
            const availableMonths = StatisticsService.getAvailableMonths(year, officeDayDates);

            let currentStats: PeriodStats;
            if (merged.selectedPeriodType === 'month') {
                currentStats = StatisticsService.calculateMonthStats(year, merged.selectedMonth, officeDayDates, timeOffDayDates);
            } else if (merged.selectedPeriodType === 'quarter') {
                currentStats = StatisticsService.calculateQuarterStats(year, merged.selectedQuarter, officeDayDates, timeOffDayDates);
            } else {
                currentStats = StatisticsService.calculateYearStats(year, officeDayDates, timeOffDayDates);
            }

            return { ...merged, selectedYear: year, availableYears, availableMonths, currentStats };
        });
    };

    const handlePeriodTypeChange = (periodType: 'month' | 'quarter' | 'year') => {
        recalculateStats({ selectedPeriodType: periodType });
    };

    const handleYearChange = (year: number) => {
        recalculateStats({ selectedYear: year });
    };

    const handleMonthChange = (month: number) => {
        recalculateStats({ selectedMonth: month });
    };

    const handleQuarterChange = (quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4') => {
        recalculateStats({ selectedQuarter: quarter });
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
                <Text style={styles.title}>Office Statistics</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.statsSection}>
                    {/* Period Type Selection */}
                    <View style={styles.periodTypeContainer}>
                        <Text style={styles.periodTypeLabel}>Select Period Type:</Text>
                        <View style={styles.periodTypeButtons}>
                            {(['month', 'quarter', 'year'] as const).map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.periodTypeButton,
                                        statisticsState.selectedPeriodType === type && styles.periodTypeButtonActive
                                    ]}
                                    onPress={() => handlePeriodTypeChange(type)}
                                >
                                    <Text style={[
                                        styles.periodTypeButtonText,
                                        statisticsState.selectedPeriodType === type && styles.periodTypeButtonTextActive
                                    ]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Year Selection */}
                    <View style={styles.selectionContainer}>
                        <Text style={styles.selectionLabel}>Year:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScrollView}>
                            {statisticsState.availableYears.map(year => (
                                <TouchableOpacity
                                    key={year}
                                    style={[
                                        styles.yearButton,
                                        statisticsState.selectedYear === year && styles.yearButtonActive
                                    ]}
                                    onPress={() => handleYearChange(year)}
                                >
                                    <Text style={[
                                        styles.yearButtonText,
                                        statisticsState.selectedYear === year && styles.yearButtonTextActive
                                    ]}>{year}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Month Selection */}
                    {statisticsState.selectedPeriodType === 'month' && (
                        <View style={styles.selectionContainer}>
                            <Text style={styles.selectionLabel}>Month:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScrollView}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[
                                            styles.monthButton,
                                            statisticsState.selectedMonth === i && styles.monthButtonActive
                                        ]}
                                        onPress={() => handleMonthChange(i)}
                                    >
                                        <Text style={[
                                            styles.monthButtonText,
                                            statisticsState.selectedMonth === i && styles.monthButtonTextActive
                                        ]}>{StatisticsService.getMonthName(i)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Quarter Selection */}
                    {statisticsState.selectedPeriodType === 'quarter' && (
                        <View style={styles.selectionContainer}>
                            <Text style={styles.selectionLabel}>Quarter:</Text>
                            <View style={styles.quarterButtons}>
                                {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(quarter => (
                                    <TouchableOpacity
                                        key={quarter}
                                        style={[
                                            styles.quarterButton,
                                            statisticsState.selectedQuarter === quarter && styles.quarterButtonActive
                                        ]}
                                        onPress={() => handleQuarterChange(quarter)}
                                    >
                                        <Text style={[
                                            styles.quarterButtonText,
                                            statisticsState.selectedQuarter === quarter && styles.quarterButtonTextActive
                                        ]}>{quarter}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Current Selection Period Stats */}
                    <View style={styles.currentStatsContainer}>
                        <Text style={styles.currentStatsTitle}>
                            {statisticsState.currentStats.period} Statistics
                        </Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statsRow}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statCardLabel}>Working Days</Text>
                                    <Text style={styles.statCardValue}>{statisticsState.currentStats.workingDays}</Text>
                                    <Text style={styles.statCardSubtext}>(Mon-Fri)</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statCardLabel}>Office Days</Text>
                                    <Text style={[styles.statCardValue, styles.statCardValuePrimary]}>{statisticsState.currentStats.officeDays}</Text>
                                    <Text style={styles.statCardSubtext}>(Logged)</Text>
                                </View>
                            </View>
                            <View style={styles.statsRow}>
                                <View style={[styles.statCard, styles.statCardTimeOff]}>
                                    <Text style={styles.statCardLabel}>Time Off</Text>
                                    <Text style={[styles.statCardValue, styles.statCardValueWarning]}>{statisticsState.currentStats.timeOffDays}</Text>
                                    <Text style={styles.statCardSubtext}>(Excluded)</Text>
                                </View>
                                <View style={[styles.statCard, styles.statCardAttendance]}>
                                    <Text style={styles.statCardLabel}>Attendance</Text>
                                    <Text style={[styles.statCardValue, styles.statCardValueSuccess]}>{statisticsState.currentStats.percentage}%</Text>
                                    <Text style={styles.statCardSubtext}>(excl. time off)</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Quarter Configuration Section */}
                    <View style={styles.quarterConfigSection}>
                        <Text style={styles.quarterConfigTitle}>Quarter Configuration</Text>
                        <Text style={styles.quarterConfigSubtitle}>
                            Configure which months belong to each quarter
                        </Text>

                        {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => (
                            <View key={q} style={styles.quarterConfigRow}>
                                <Text style={styles.quarterLabel}>{q}:</Text>
                                <View style={styles.monthToggleContainer}>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={[
                                                styles.monthToggle,
                                                quarterConfig[q].includes(i) && styles.monthToggleActive
                                            ]}
                                            onPress={() => {
                                                const newConfig = { ...quarterConfig };
                                                if (newConfig[q].includes(i)) {
                                                    newConfig[q] = newConfig[q].filter(m => m !== i);
                                                } else {
                                                    newConfig[q].push(i);
                                                }
                                                setQuarterConfig(newConfig);
                                            }}
                                        >
                                            <Text style={[
                                                styles.monthToggleText,
                                                quarterConfig[q].includes(i) && styles.monthToggleTextActive
                                            ]}>
                                                {StatisticsService.getMonthName(i).substring(0, 3)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}

                        <View style={styles.configActions}>
                            <TouchableOpacity
                                style={styles.saveConfigButton}
                                onPress={() => {
                                    StatisticsService.setQuarterConfig(quarterConfig);
                                    recalculateStats();
                                    Alert.alert('Success!', 'Quarter configuration saved successfully!');
                                }}
                            >
                                <Text style={styles.saveConfigButtonText}>Save Configuration</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.resetConfigButton}
                                onPress={() => {
                                    const defaultConfig = {
                                        Q1: [0, 1, 2],
                                        Q2: [3, 4, 5],
                                        Q3: [6, 7, 8],
                                        Q4: [9, 10, 11]
                                    };
                                    setQuarterConfig(defaultConfig);
                                    StatisticsService.setQuarterConfig(defaultConfig);
                                    recalculateStats();
                                    Alert.alert('Reset Complete', 'Quarter configuration reset to default!');
                                }}
                            >
                                <Text style={styles.resetConfigButtonText}>Reset to Default</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
            width: '100%',
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
            textAlign: 'center',
        },
        placeholder: {
            width: 50,
        },
        scrollView: {
            flex: 1,
            paddingHorizontal: theme.spacing.lg,
        },
        statsSection: {
            width: '100%',
            marginTop: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
        },
        periodTypeContainer: {
            width: '100%',
            marginBottom: theme.spacing.xl,
        },
        periodTypeLabel: {
            fontSize: theme.typography.sizes.footnote,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
        },
        periodTypeButtons: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
        },
        periodTypeButton: {
            backgroundColor: theme.glass.surfaceSecondary.background,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.xl,
            borderRadius: theme.borderRadius.pill,
            borderWidth: theme.glass.surfaceSecondary.borderWidth,
            borderColor: theme.glass.surfaceSecondary.borderColor,
        },
        periodTypeButtonActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        periodTypeButtonText: {
            fontSize: theme.typography.sizes.body,
            color: theme.colors.textPrimary,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
        },
        periodTypeButtonTextActive: {
            color: theme.colors.textInverse,
        },
        selectionContainer: {
            width: '100%',
            marginBottom: theme.spacing.xl,
        },
        selectionLabel: {
            fontSize: theme.typography.sizes.footnote,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
        },
        yearScrollView: {
            maxHeight: 50,
        },
        yearButton: {
            backgroundColor: theme.glass.surfaceSecondary.background,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.lg,
            borderRadius: theme.borderRadius.pill,
            marginHorizontal: theme.spacing.xs,
            borderWidth: theme.glass.surfaceSecondary.borderWidth,
            borderColor: theme.glass.surfaceSecondary.borderColor,
        },
        yearButtonActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        yearButtonText: {
            fontSize: theme.typography.sizes.body,
            color: theme.colors.textPrimary,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
        },
        yearButtonTextActive: {
            color: theme.colors.textInverse,
        },
        monthScrollView: {
            maxHeight: 50,
        },
        monthButton: {
            backgroundColor: theme.glass.surfaceSecondary.background,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.lg,
            borderRadius: theme.borderRadius.pill,
            marginHorizontal: theme.spacing.xs,
            borderWidth: theme.glass.surfaceSecondary.borderWidth,
            borderColor: theme.glass.surfaceSecondary.borderColor,
        },
        monthButtonActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        monthButtonText: {
            fontSize: theme.typography.sizes.body,
            color: theme.colors.textPrimary,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
        },
        monthButtonTextActive: {
            color: theme.colors.textInverse,
        },
        quarterButtons: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
        },
        quarterButton: {
            backgroundColor: theme.glass.surfaceSecondary.background,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.xl,
            borderRadius: theme.borderRadius.pill,
            borderWidth: theme.glass.surfaceSecondary.borderWidth,
            borderColor: theme.glass.surfaceSecondary.borderColor,
        },
        quarterButtonActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        quarterButtonText: {
            fontSize: theme.typography.sizes.body,
            color: theme.colors.textPrimary,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
        },
        quarterButtonTextActive: {
            color: theme.colors.textInverse,
        },
        currentStatsContainer: {
            width: '100%',
            marginTop: theme.spacing.xxl,
            marginBottom: theme.spacing.xxl,
            padding: theme.spacing.lg,
            backgroundColor: theme.glass.surface.background,
            borderRadius: theme.borderRadius.xl,
            borderWidth: theme.glass.surface.borderWidth,
            borderColor: theme.glass.surface.borderColor,
        },
        currentStatsTitle: {
            fontSize: theme.typography.sizes.headline,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
            color: theme.colors.textPrimary,
            textAlign: 'center',
            marginBottom: theme.spacing.xl,
        },
        statsGrid: {
            width: '100%',
            gap: theme.spacing.sm,
        },
        statsRow: {
            flexDirection: 'row',
            gap: theme.spacing.sm,
        },
        statCard: {
            flex: 1,
            alignItems: 'center',
            padding: theme.spacing.md,
            backgroundColor: theme.glass.surfaceSecondary.background,
            borderRadius: theme.borderRadius.md,
            borderWidth: theme.glass.surfaceSecondary.borderWidth,
            borderColor: theme.glass.surfaceSecondary.borderColor,
        },
        statCardTimeOff: {
            backgroundColor: theme.colors.warningMuted,
            borderColor: theme.colors.warning,
        },
        statCardAttendance: {
            backgroundColor: theme.colors.successMuted,
            borderColor: theme.colors.success,
        },
        statCardLabel: {
            fontSize: theme.typography.sizes.footnote,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
        },
        statCardValue: {
            fontSize: theme.typography.sizes.title2,
            fontWeight: theme.typography.weights.bold as any,
            fontFamily: theme.fonts.bold,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.xs,
        },
        statCardValuePrimary: {
            color: theme.colors.primary,
        },
        statCardValueWarning: {
            color: theme.colors.warning,
        },
        statCardValueSuccess: {
            color: theme.colors.success,
        },
        statCardSubtext: {
            fontSize: theme.typography.sizes.caption,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textTertiary,
            textAlign: 'center',
        },
        quarterConfigSection: {
            width: '100%',
            marginTop: theme.spacing.xl,
            padding: theme.spacing.lg,
            backgroundColor: theme.glass.surface.background,
            borderRadius: theme.borderRadius.xl,
            borderWidth: theme.glass.surface.borderWidth,
            borderColor: theme.glass.surface.borderColor,
        },
        quarterConfigTitle: {
            fontSize: theme.typography.sizes.headline,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
            color: theme.colors.textPrimary,
            textAlign: 'center',
            marginBottom: theme.spacing.sm,
        },
        quarterConfigSubtitle: {
            fontSize: theme.typography.sizes.footnote,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: theme.spacing.xl,
            fontStyle: 'italic',
        },
        quarterConfigRow: {
            marginBottom: theme.spacing.lg,
        },
        quarterLabel: {
            fontSize: theme.typography.sizes.callout,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
        },
        monthToggleContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: theme.spacing.sm,
        },
        monthToggle: {
            backgroundColor: theme.glass.surfaceSecondary.background,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.borderRadius.pill,
            borderWidth: theme.glass.surfaceSecondary.borderWidth,
            borderColor: theme.glass.surfaceSecondary.borderColor,
            minWidth: 45,
            alignItems: 'center',
        },
        monthToggleActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        monthToggleText: {
            fontSize: theme.typography.sizes.caption,
            color: theme.colors.textSecondary,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
        },
        monthToggleTextActive: {
            color: theme.colors.textInverse,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
        },
        configActions: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: theme.spacing.xl,
            gap: theme.spacing.md,
        },
        saveConfigButton: {
            backgroundColor: theme.colors.success,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.xl,
            borderRadius: theme.borderRadius.pill,
            alignItems: 'center',
        },
        saveConfigButtonText: {
            color: theme.colors.textInverse,
            fontSize: theme.typography.sizes.footnote,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
        },
        resetConfigButton: {
            backgroundColor: theme.colors.danger,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.xl,
            borderRadius: theme.borderRadius.pill,
            alignItems: 'center',
        },
        resetConfigButtonText: {
            color: theme.colors.textInverse,
            fontSize: theme.typography.sizes.footnote,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
        },
    });

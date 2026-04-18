import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Theme } from '../theme';

interface OfficeDayEvent {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
}

interface PastOfficeDaysScreenProps {
    pastOfficeDays: OfficeDayEvent[];
    pastTimeOffDays: OfficeDayEvent[];
    onBack: () => void;
    onDeleteOfficeDay: (eventId: string, eventDate: Date) => void;
}

export default function PastOfficeDaysScreen({ pastOfficeDays, pastTimeOffDays, onBack, onDeleteOfficeDay }: PastOfficeDaysScreenProps) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const allEvents = [...pastOfficeDays, ...pastTimeOffDays]
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isDuplicate = (date: Date, index: number) => {
        const dateString = date.toDateString();
        return pastOfficeDays.findIndex((event, i) =>
            new Date(event.startDate).toDateString() === dateString && i !== index
        ) !== -1;
    };

    const renderEventItem = ({ item, index }: { item: OfficeDayEvent; index: number }) => {
        const isTimeOff = item.title === 'Time Off';
        const isDuplicateEntry = !isTimeOff && isDuplicate(item.startDate, index);
        const deleteLabel = isTimeOff ? 'time off' : 'office day';

        return (
            <View style={[
                styles.eventItem,
                isTimeOff && styles.timeOffEventItem,
                isDuplicateEntry && styles.duplicateEventItem
            ]}>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventDate}>{formatDate(item.startDate)}</Text>
                    <Text style={[styles.eventTitle, isTimeOff && styles.timeOffTitle]}>{item.title}</Text>
                    {isDuplicateEntry && (
                        <Text style={styles.duplicateWarning}>Duplicate Entry</Text>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                        Alert.alert(
                            `Delete ${item.title}`,
                            `Are you sure you want to delete the ${deleteLabel} for ${formatDate(item.startDate)}?`,
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', style: 'destructive', onPress: () => onDeleteOfficeDay(item.id, item.startDate) }
                            ]
                        );
                    }}
                >
                    <View style={styles.deleteButtonRow}>
                        <Ionicons name="trash-outline" size={14} color={theme.colors.danger} />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
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
                <Text style={styles.title}>Past Events</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                <Text style={styles.deleteInstructionText}>
                    Tap Delete to remove an entry
                </Text>

                <FlatList
                    data={allEvents}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEventItem}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No events logged yet</Text>
                    }
                />
            </View>
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
        content: {
            flex: 1,
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
        },
        deleteInstructionText: {
            fontSize: theme.typography.sizes.footnote,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: theme.spacing.md,
        },
        eventItem: {
            width: '100%',
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            borderBottomWidth: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.glass.surface.background,
            borderWidth: theme.glass.surface.borderWidth,
            borderColor: theme.glass.surface.borderColor,
            marginBottom: theme.spacing.sm,
            borderRadius: theme.borderRadius.lg,
            ...theme.shadow.sm,
        },
        eventInfo: {
            flex: 1,
        },
        eventDate: {
            fontSize: theme.typography.sizes.footnote,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.xs,
        },
        eventTitle: {
            fontSize: theme.typography.sizes.callout,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
            color: theme.colors.textPrimary,
        },
        deleteButton: {
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.md,
            backgroundColor: theme.colors.dangerMuted,
            borderRadius: theme.borderRadius.sm,
            marginLeft: theme.spacing.sm,
        },
        deleteButtonRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        deleteButtonText: {
            fontSize: theme.typography.sizes.footnote,
            color: theme.colors.danger,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
        },
        emptyText: {
            fontSize: theme.typography.sizes.callout,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textTertiary,
            textAlign: 'center',
            marginTop: 50,
        },
        duplicateEventItem: {
            backgroundColor: theme.colors.dangerMuted,
            borderColor: theme.colors.danger,
            borderWidth: 2,
        },
        duplicateWarning: {
            fontSize: theme.typography.sizes.caption,
            fontFamily: theme.fonts.regular,
            color: theme.colors.danger,
            marginTop: theme.spacing.xs,
        },
        timeOffEventItem: {
            backgroundColor: theme.colors.warningMuted,
            borderColor: theme.colors.warning,
        },
        timeOffTitle: {
            color: theme.colors.warning,
        },
    });

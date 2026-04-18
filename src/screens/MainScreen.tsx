import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    Modal,
} from 'react-native';
import * as Calendar from 'expo-calendar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Theme } from '../theme';
import StatisticsScreen from './StatisticsScreen';
import PastOfficeDaysScreen from './PastOfficeDaysScreen';
import SettingsScreen from './SettingsScreen';

const EVENT_TITLE_OFFICE_DAY = 'Office Day';
const EVENT_TITLE_TIME_OFF = 'Time Off';

interface OfficeDayEvent {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
}

const getWritableCalendar = async (calendars: Calendar.Calendar[]) => {
    return calendars.find(cal => cal.isPrimary)
        || calendars.find(cal => cal.source?.isLocalAccount || cal.source?.type === 'local')
        || calendars.find(cal => cal.accessLevel === Calendar.CalendarAccessLevel.OWNER)
        || calendars[0]
        || null;
};

const getUTCDayRange = (date: Date) => {
    const startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1));
    return { startDate, endDate };
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
};

export default function MainScreen() {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [isLoggedToday, setIsLoggedToday] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [hasPermissions, setHasPermissions] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [pastOfficeDays, setPastOfficeDays] = useState<OfficeDayEvent[]>([]);
    const [pastTimeOffDays, setPastTimeOffDays] = useState<OfficeDayEvent[]>([]);
    const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

    const [currentScreen, setCurrentScreen] = useState<'main' | 'statistics' | 'pastOfficeDays' | 'settings'>('main');

    const calendarsRef = useRef<Calendar.Calendar[]>([]);

    const fetchCalendars = async () => {
        const all = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        calendarsRef.current = all;
        return calendarsRef.current;
    };

    useEffect(() => {
        setupApp();
    }, []);

    useEffect(() => {
        if (showDatePicker) {
            loadPastOfficeDays();
        }
    }, [showDatePicker]);

    const setupApp = async () => {
        try {
            const calendarPermission = await Calendar.requestCalendarPermissionsAsync();

            if (calendarPermission.status === 'granted') {
                setHasPermissions(true);
                await fetchCalendars();
                await Promise.all([checkIfLoggedToday(), loadPastOfficeDays()]);
            } else {
                setHasPermissions(false);
                setIsChecking(false);
            }
        } catch (error) {
            console.error('Error setting up app:', error);
            setHasPermissions(false);
            setIsChecking(false);
        }
    };

    const checkIfLoggedToday = async () => {
        try {
            setIsChecking(true);
            const calendarIds = calendarsRef.current.map(cal => cal.id);

            if (calendarIds.length === 0) {
                setIsLoggedToday(false);
                return;
            }

            const { startDate, endDate } = getUTCDayRange(new Date());

            const events = await Calendar.getEventsAsync(
                calendarIds,
                startDate,
                endDate
            );

            const hasOfficeDay = events.some(event =>
                event.title === EVENT_TITLE_OFFICE_DAY && event.allDay === true
            );

            setIsLoggedToday(hasOfficeDay);
        } catch (error) {
            console.error('Error checking if logged today:', error);
            setIsLoggedToday(false);
        } finally {
            setIsChecking(false);
        }
    };

    const loadPastOfficeDays = async () => {
        try {
            const calendarIds = calendarsRef.current.map(cal => cal.id);

            if (calendarIds.length === 0) return;

            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 2);

            const events = await Calendar.getEventsAsync(
                calendarIds,
                startDate,
                endDate
            );

            const mapEvent = (event: any) => {
                const eventDate = new Date(event.startDate);

                if (event.timeZone === 'UTC') {
                    const utcYear = eventDate.getUTCFullYear();
                    const utcMonth = eventDate.getUTCMonth();
                    const utcDate = eventDate.getUTCDate();
                    const localDate = new Date(utcYear, utcMonth, utcDate);

                    return {
                        id: event.id,
                        title: event.title,
                        startDate: localDate,
                        endDate: new Date(event.endDate),
                    };
                }

                if (event.timeZone && event.timeZone !== 'UTC') {
                    const localStartDate = new Date(eventDate.getTime() + eventDate.getTimezoneOffset() * 60000);
                    return {
                        id: event.id,
                        title: event.title,
                        startDate: localStartDate,
                        endDate: new Date(event.endDate),
                    };
                }

                return {
                    id: event.id,
                    title: event.title,
                    startDate: eventDate,
                    endDate: new Date(event.endDate),
                };
            };

            const sortByDate = (a: OfficeDayEvent, b: OfficeDayEvent) => b.startDate.getTime() - a.startDate.getTime();

            const officeDayEvents = events
                .filter(event => event.title === EVENT_TITLE_OFFICE_DAY && event.allDay === true)
                .map(mapEvent)
                .sort(sortByDate);

            const timeOffEvents = events
                .filter(event => event.title === EVENT_TITLE_TIME_OFF && event.allDay === true)
                .map(mapEvent)
                .sort(sortByDate);

            setPastOfficeDays(officeDayEvents);
            setPastTimeOffDays(timeOffEvents);
        } catch (error) {
            console.error('Error loading past office days:', error);
        }
    };

    const getExistingEventsForDate = async (date: Date) => {
        const calendarIds = calendarsRef.current.map(cal => cal.id);
        if (calendarIds.length === 0) throw new Error('No calendar available');
        const { startDate, endDate } = getUTCDayRange(date);
        return Calendar.getEventsAsync(calendarIds, startDate, endDate);
    };

    const handleLogOfficeDay = async () => {
        if (!hasPermissions) {
            Alert.alert('Permissions Required', 'Please grant calendar permissions to use this app.', [{ text: 'OK' }]);
            return;
        }

        try {
            setIsLoading(true);

            const existingEvents = await getExistingEventsForDate(selectedDate);

            if (existingEvents.some(e => e.title === EVENT_TITLE_OFFICE_DAY && e.allDay)) {
                Alert.alert(
                    'Duplicate Entry',
                    `An office day already exists for ${formatDate(selectedDate)}. Would you like to proceed anyway?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Proceed', style: 'destructive', onPress: () => createOfficeDayEvent() }
                    ]
                );
                setIsLoading(false);
                return;
            }

            await createOfficeDayEvent();

        } catch (error) {
            console.error('Error logging office day:', error);
            Alert.alert('Error', 'Failed to log office day. Please try again.', [{ text: 'OK' }]);
            setIsLoading(false);
        }
    };

    const createOfficeDayEvent = async () => {
        try {
            const calendar = await getWritableCalendar(calendarsRef.current);

            if (!calendar) {
                throw new Error('No calendar available');
            }

            const { startDate, endDate } = getUTCDayRange(selectedDate);

            await Calendar.createEventAsync(calendar.id, {
                title: EVENT_TITLE_OFFICE_DAY,
                startDate: startDate,
                endDate: endDate,
                allDay: true,
                timeZone: 'UTC',
                location: 'Office',
                notes: 'Logged via Office Days app',
            });

            const today = new Date();
            if (selectedDate.toDateString() === today.toDateString()) {
                setIsLoggedToday(true);
            }

            Alert.alert('Success!', `Office Day logged for ${formatDate(selectedDate)}!`, [{ text: 'OK' }]);

            setSelectedDate(new Date());

            await loadPastOfficeDays();
            if (showDatePicker) {
                setCalendarRefreshKey(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error creating office day event:', error);
            Alert.alert('Error', 'Failed to create office day event. Please try again.', [{ text: 'OK' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogTimeOff = async () => {
        if (!hasPermissions) {
            Alert.alert('Permissions Required', 'Please grant calendar permissions to use this app.', [{ text: 'OK' }]);
            return;
        }

        try {
            setIsLoading(true);

            const existingEvents = await getExistingEventsForDate(selectedDate);

            if (existingEvents.some(e => e.title === EVENT_TITLE_OFFICE_DAY && e.allDay)) {
                Alert.alert('Conflict', `An office day already exists for ${formatDate(selectedDate)}. You cannot log both an office day and time off on the same date.`, [{ text: 'OK' }]);
                setIsLoading(false);
                return;
            }

            if (existingEvents.some(e => e.title === EVENT_TITLE_TIME_OFF && e.allDay)) {
                Alert.alert('Duplicate Entry', `Time off already exists for ${formatDate(selectedDate)}.`, [{ text: 'OK' }]);
                setIsLoading(false);
                return;
            }

            const calendar = await getWritableCalendar(calendarsRef.current);
            if (!calendar) {
                throw new Error('No calendar available');
            }

            const { startDate, endDate } = getUTCDayRange(selectedDate);

            await Calendar.createEventAsync(calendar.id, {
                title: EVENT_TITLE_TIME_OFF,
                startDate,
                endDate,
                allDay: true,
                timeZone: 'UTC',
                notes: 'Logged via Office Days app',
            });

            Alert.alert('Success!', `Time Off logged for ${formatDate(selectedDate)}!`, [{ text: 'OK' }]);

            setSelectedDate(new Date());

            await loadPastOfficeDays();
            if (showDatePicker) {
                setCalendarRefreshKey(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error logging time off:', error);
            Alert.alert('Error', 'Failed to log time off. Please try again.', [{ text: 'OK' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const openDatePicker = async () => {
        await loadPastOfficeDays();
        setCalendarRefreshKey(prev => prev + 1);
        setShowDatePicker(true);
    };

    const deleteOfficeDay = async (eventId: string, eventDate: Date) => {
        try {
            await Calendar.deleteEventAsync(eventId);

            await loadPastOfficeDays();

            if (showDatePicker) {
                setCalendarRefreshKey(prev => prev + 1);
            }

            const today = new Date();
            if (eventDate.toDateString() === today.toDateString()) {
                setIsLoggedToday(false);
            }

            Alert.alert('Success!', 'Office day deleted successfully!', [{ text: 'OK' }]);
        } catch (error) {
            console.error('Error deleting office day:', error);
            Alert.alert('Error', 'Failed to delete office day. Please try again.', [{ text: 'OK' }]);
        }
    };

    const renderCalendarDays = () => {
        const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

        const days: React.ReactElement[] = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<View key={`empty-${i}`} style={styles.calendarDayCell} />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isOfficeDay = pastOfficeDays.some(event => {
                const eventDate = new Date(event.startDate);
                return eventDate.getDate() === day &&
                    eventDate.getMonth() === selectedDate.getMonth() &&
                    eventDate.getFullYear() === selectedDate.getFullYear();
            });
            const isTimeOff = pastTimeOffDays.some(event => {
                const eventDate = new Date(event.startDate);
                return eventDate.getDate() === day &&
                    eventDate.getMonth() === selectedDate.getMonth() &&
                    eventDate.getFullYear() === selectedDate.getFullYear();
            });

            days.push(
                <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                        styles.calendarDayCell,
                        isOfficeDay && styles.officeDayCell,
                        isTimeOff && styles.timeOffDayCell,
                        isToday && styles.todayCell,
                        isSelected && styles.selectedDayCell,
                    ]}
                    onPress={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(day);
                        setSelectedDate(newDate);
                    }}
                    onLongPress={() => {
                        if (isOfficeDay) {
                            const eventDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                            const event = pastOfficeDays.find(event => {
                                const eventDateObj = new Date(event.startDate);
                                return eventDateObj.getDate() === day &&
                                    eventDateObj.getMonth() === selectedDate.getMonth() &&
                                    eventDateObj.getFullYear() === selectedDate.getFullYear();
                            });

                            if (event) {
                                Alert.alert(
                                    'Delete Office Day',
                                    `Are you sure you want to delete the office day for ${formatDate(eventDate)}?`,
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'Delete', style: 'destructive', onPress: () => deleteOfficeDay(event.id, eventDate) }
                                    ]
                                );
                            }
                        }
                    }}
                >
                    <Text style={[styles.calendarDayText, isSelected && styles.selectedDayText]}>
                        {day}
                    </Text>
                </TouchableOpacity>
            );
        }
        return days;
    };

    if (isChecking) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Setting up app...</Text>
            </View>
        );
    }

    if (!hasPermissions) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionTitle}>Permissions Required</Text>
                    <Text style={styles.permissionText}>
                        This app needs access to your calendar to function properly.
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={setupApp}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (currentScreen === 'statistics') {
        return (
            <StatisticsScreen
                pastOfficeDays={pastOfficeDays}
                pastTimeOffDays={pastTimeOffDays}
                onBack={() => setCurrentScreen('main')}
            />
        );
    }

    if (currentScreen === 'pastOfficeDays') {
        return (
            <PastOfficeDaysScreen
                pastOfficeDays={pastOfficeDays}
                pastTimeOffDays={pastTimeOffDays}
                onBack={() => setCurrentScreen('main')}
                onDeleteOfficeDay={deleteOfficeDay}
            />
        );
    }

    if (currentScreen === 'settings') {
        return (
            <SettingsScreen
                onBack={() => setCurrentScreen('main')}
            />
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setShowMenu(true)}
                >
                    <Ionicons name="menu" size={theme.typography.sizes.title2} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title} testID="header-title">Office Days</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.mainScrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.subtitle}>
                    {isLoggedToday
                        ? "You've logged your office day today!"
                        : "Tap the button below to log your office day"
                    }
                </Text>

                {/* Date Selection */}
                <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>Date:</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={openDatePicker}
                        testID="date-picker-button"
                    >
                        <Text style={styles.dateButtonText}>
                            {formatDateShort(selectedDate)}
                            {isDateInPast(selectedDate) ? ' (Past)' : ''}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Main Log Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.logButton,
                            isLoading && styles.logButtonDisabled
                        ]}
                        onPress={handleLogOfficeDay}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={theme.colors.textInverse} />
                        ) : (
                            <Text style={styles.buttonText}>
                                Log Office Day
                            </Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.timeOffButton,
                            isLoading && styles.logButtonDisabled
                        ]}
                        onPress={handleLogTimeOff}
                        disabled={isLoading}
                        activeOpacity={0.8}
                        testID="log-time-off-button"
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={theme.colors.textInverse} />
                        ) : (
                            <Text style={styles.timeOffButtonText}>
                                Log Time Off
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Events will be logged as all-day entries in your default calendar.
                    </Text>
                </View>
            </ScrollView>

            {/* Custom Date Picker Modal */}
            <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.datePickerModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Date</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Ionicons name="close" size={theme.typography.sizes.title3} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.datePickerScrollView}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.datePickerScrollContent}
                        >
                            <Text style={styles.datePickerLabel}>Current: {formatDateShort(selectedDate)}</Text>

                            {/* Calendar Navigation */}
                            <View style={styles.calendarHeader}>
                                <TouchableOpacity
                                    style={styles.calendarNavButton}
                                    onPress={async () => {
                                        const newDate = new Date(selectedDate);
                                        newDate.setMonth(newDate.getMonth() - 1);
                                        setSelectedDate(newDate);
                                        await loadPastOfficeDays();
                                    }}
                                >
                                    <Ionicons name="chevron-back" size={theme.typography.sizes.title2} color={theme.colors.primary} />
                                </TouchableOpacity>

                                <Text style={styles.calendarMonthText}>
                                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </Text>

                                <TouchableOpacity
                                    style={styles.calendarNavButton}
                                    onPress={async () => {
                                        const newDate = new Date(selectedDate);
                                        newDate.setMonth(newDate.getMonth() + 1);
                                        if (newDate <= new Date()) {
                                            setSelectedDate(newDate);
                                            await loadPastOfficeDays();
                                        }
                                    }}
                                    disabled={selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear()}
                                >
                                    <Ionicons
                                        name="chevron-forward"
                                        size={theme.typography.sizes.title2}
                                        color={(selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear()) ? theme.colors.disabled : theme.colors.primary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Calendar Grid */}
                            <View style={styles.calendarGrid} key={calendarRefreshKey}>
                                <View style={styles.calendarDayHeaders}>
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
                                    ))}
                                </View>

                                <View style={styles.calendarDaysContainer}>
                                    {renderCalendarDays()}
                                </View>
                            </View>

                            {/* Quick Preset Buttons */}
                            <View style={styles.presetButtonsContainer}>
                                <TouchableOpacity
                                    style={styles.presetButton}
                                    onPress={() => {
                                        const today = new Date();
                                        setSelectedDate(today);
                                    }}
                                >
                                    <Text style={styles.presetButtonText}>Today</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.presetButton}
                                    onPress={() => {
                                        const yesterday = new Date();
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        setSelectedDate(yesterday);
                                    }}
                                >
                                    <Text style={styles.presetButtonText}>Yesterday</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Confirm Button */}
                            <TouchableOpacity
                                style={styles.confirmDateButton}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={styles.confirmDateButtonText}>Confirm Date</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Menu Modal */}
            <Modal
                visible={showMenu}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowMenu(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.menuModal}>
                        <View style={styles.menuHeader}>
                            <Text style={styles.menuTitle}>Menu</Text>
                            <TouchableOpacity onPress={() => setShowMenu(false)}>
                                <Ionicons name="close" size={theme.typography.sizes.title3} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setShowMenu(false);
                                setCurrentScreen('pastOfficeDays');
                            }}
                        >
                            <View style={styles.menuItemRow}>
                                <Ionicons name="calendar-outline" size={20} color={theme.colors.textPrimary} style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>Past Office Days</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setShowMenu(false);
                                setCurrentScreen('statistics');
                            }}
                        >
                            <View style={styles.menuItemRow}>
                                <Ionicons name="bar-chart-outline" size={20} color={theme.colors.textPrimary} style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>View Statistics</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setShowMenu(false);
                                setCurrentScreen('settings');
                            }}
                        >
                            <View style={styles.menuItemRow}>
                                <Ionicons name="settings-outline" size={20} color={theme.colors.textPrimary} style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>Settings</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        menuButton: {
            padding: theme.spacing.sm,
        },
        title: {
            fontSize: theme.typography.sizes.title2,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
            color: theme.colors.textPrimary,
            textAlign: 'center',
        },
        placeholder: {
            width: 50,
        },
        mainScrollView: {
            flex: 1,
            paddingHorizontal: theme.spacing.lg,
        },
        subtitle: {
            fontSize: theme.typography.sizes.body,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.relaxed,
            marginTop: theme.spacing.xxxl,
            marginBottom: theme.spacing.xxxl,
        },
        dateContainer: {
            width: '100%',
            alignItems: 'center',
            marginBottom: theme.spacing.xxl,
        },
        dateLabel: {
            fontSize: theme.typography.sizes.callout,
            color: theme.colors.textPrimary,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
            marginBottom: theme.spacing.sm,
        },
        dateButton: {
            backgroundColor: theme.glass.surfaceSecondary.background,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.xl,
            borderRadius: theme.borderRadius.md,
            borderWidth: theme.glass.surfaceSecondary.borderWidth,
            borderColor: theme.glass.surfaceSecondary.borderColor,
            minWidth: 200,
            alignItems: 'center',
        },
        dateButtonText: {
            fontSize: theme.typography.sizes.callout,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textPrimary,
        },
        buttonContainer: {
            width: '100%',
            alignItems: 'center',
            marginBottom: theme.spacing.xxxl,
        },
        logButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: theme.spacing.lg,
            paddingHorizontal: theme.spacing.xxxl,
            borderRadius: theme.borderRadius.pill,
            minWidth: 200,
            alignItems: 'center',
            ...theme.shadow.lg,
        },
        logButtonDisabled: {
            backgroundColor: theme.colors.disabled,
        },
        buttonText: {
            color: theme.colors.textInverse,
            fontSize: theme.typography.sizes.callout,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
        },
        timeOffButton: {
            backgroundColor: theme.colors.warningMuted,
            paddingVertical: theme.spacing.lg,
            paddingHorizontal: theme.spacing.xxxl,
            borderRadius: theme.borderRadius.pill,
            minWidth: 200,
            alignItems: 'center' as const,
            marginTop: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.warning,
            ...theme.shadow.sm,
        },
        timeOffButtonText: {
            color: theme.colors.warning,
            fontSize: theme.typography.sizes.callout,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
        },
        footer: {
            width: '100%',
            paddingHorizontal: theme.spacing.lg,
            marginTop: theme.spacing.xl,
            alignItems: 'center',
            marginBottom: theme.spacing.xxxl,
        },
        footerText: {
            fontSize: theme.typography.sizes.footnote,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textTertiary,
            textAlign: 'center',
            lineHeight: theme.typography.sizes.footnote * theme.typography.lineHeights.relaxed,
        },
        permissionContainer: {
            alignItems: 'center',
            paddingHorizontal: theme.spacing.xxxl,
        },
        permissionTitle: {
            fontSize: theme.typography.sizes.title2,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.xl,
            textAlign: 'center',
        },
        permissionText: {
            fontSize: theme.typography.sizes.body,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.relaxed,
            marginBottom: theme.spacing.lg,
        },
        loadingText: {
            marginTop: theme.spacing.xl,
            fontSize: theme.typography.sizes.body,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textSecondary,
        },
        retryButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.xxl,
            borderRadius: theme.borderRadius.pill,
            minWidth: 200,
            alignItems: 'center',
            ...theme.shadow.md,
        },
        retryButtonText: {
            color: theme.colors.textInverse,
            fontSize: theme.typography.sizes.callout,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
        },
        modalOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.overlay,
        },
        menuModal: {
            backgroundColor: theme.glass.modal.background,
            borderRadius: theme.borderRadius.xl,
            borderWidth: theme.glass.modal.borderWidth,
            borderColor: theme.glass.modal.borderColor,
            padding: theme.spacing.xl,
            width: '80%',
            alignItems: 'center',
        },
        menuHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginBottom: theme.spacing.xl,
        },
        menuTitle: {
            fontSize: theme.typography.sizes.title3,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
            color: theme.colors.textPrimary,
        },
        menuItem: {
            width: '100%',
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderLight,
        },
        menuItemRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        menuItemIcon: {
            marginRight: theme.spacing.md,
        },
        menuItemText: {
            fontSize: theme.typography.sizes.callout,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textPrimary,
        },
        datePickerModal: {
            backgroundColor: theme.glass.modal.background,
            borderRadius: theme.borderRadius.xl,
            borderWidth: theme.glass.modal.borderWidth,
            borderColor: theme.glass.modal.borderColor,
            padding: theme.spacing.xl,
            width: '80%',
            alignItems: 'center',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginBottom: theme.spacing.xl,
        },
        modalTitle: {
            fontSize: theme.typography.sizes.title3,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
            color: theme.colors.textPrimary,
        },
        datePickerScrollView: {
            width: '100%',
            maxHeight: 400,
        },
        datePickerScrollContent: {
            alignItems: 'center',
            paddingBottom: theme.spacing.xl,
        },
        datePickerLabel: {
            fontSize: theme.typography.sizes.callout,
            fontFamily: theme.fonts.regular,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.xl,
            textAlign: 'center',
        },
        calendarHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginBottom: theme.spacing.md,
        },
        calendarMonthText: {
            fontSize: theme.typography.sizes.headline,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
            color: theme.colors.textPrimary,
        },
        calendarNavButton: {
            padding: theme.spacing.sm,
        },
        calendarGrid: {
            width: '100%',
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
            borderRadius: theme.borderRadius.md,
            overflow: 'hidden',
        },
        calendarDaysContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: '100%',
        },
        calendarDayHeaders: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: theme.spacing.sm,
            backgroundColor: theme.glass.surfaceSecondary.background,
        },
        calendarDayHeader: {
            fontSize: theme.typography.sizes.footnote,
            color: theme.colors.textSecondary,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
        },
        calendarDayCell: {
            width: '14.28%',
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderLight,
        },
        calendarDayText: {
            fontSize: theme.typography.sizes.body,
            color: theme.colors.textPrimary,
            fontWeight: theme.typography.weights.medium as any,
            fontFamily: theme.fonts.medium,
        },
        selectedDayCell: {
            backgroundColor: theme.colors.calendarSelected,
            borderRadius: theme.borderRadius.md,
        },
        selectedDayText: {
            color: theme.colors.textInverse,
        },
        officeDayCell: {
            backgroundColor: theme.colors.calendarOfficeDay,
            borderRadius: theme.borderRadius.md,
        },
        timeOffDayCell: {
            backgroundColor: theme.colors.calendarTimeOff,
            borderRadius: theme.borderRadius.md,
        },
        todayCell: {
            backgroundColor: theme.colors.calendarToday,
            borderRadius: theme.borderRadius.md,
        },
        presetButtonsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
            marginTop: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
        },
        presetButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.xxl,
            borderRadius: theme.borderRadius.md,
            alignItems: 'center',
        },
        presetButtonText: {
            color: theme.colors.textInverse,
            fontSize: theme.typography.sizes.body,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
        },
        confirmDateButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.xxl,
            borderRadius: theme.borderRadius.pill,
            minWidth: 200,
            alignItems: 'center',
            ...theme.shadow.md,
        },
        confirmDateButtonText: {
            color: theme.colors.textInverse,
            fontSize: theme.typography.sizes.callout,
            fontWeight: theme.typography.weights.semibold as any,
            fontFamily: theme.fonts.semibold,
        },
    });

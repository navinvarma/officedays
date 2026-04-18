import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import PastOfficeDaysScreen from '../../screens/PastOfficeDaysScreen';
import { Alert } from 'react-native';
import { renderWithTheme } from '../testUtils';
import {
    APRIL_2026_OFFICE_DAYS,
    APRIL_2026_TIME_OFF,
    DUPLICATE_OFFICE_DAYS,
    NO_EVENTS,
} from '../fixtures/calendarData';

jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
    if (buttons && buttons[1] && buttons[1].onPress) {
        buttons[1].onPress();
    }
});

const mockOnBack = jest.fn();
const mockOnDelete = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
});

const renderScreen = (
    officeDays = APRIL_2026_OFFICE_DAYS,
    timeOffDays = APRIL_2026_TIME_OFF,
) =>
    renderWithTheme(
        <PastOfficeDaysScreen
            pastOfficeDays={officeDays}
            pastTimeOffDays={timeOffDays}
            onBack={mockOnBack}
            onDeleteOfficeDay={mockOnDelete}
        />
    );

describe('PastOfficeDaysScreen', () => {
    describe('Rendering', () => {
        it('should render header and back button', async () => {
            const { getByText } = renderScreen();

            await waitFor(() => {
                expect(getByText('Past Events')).toBeTruthy();
                expect(getByText('Back')).toBeTruthy();
                expect(getByText('Tap Delete to remove an entry')).toBeTruthy();
            });
        });

        it('should display all office days and time off entries', async () => {
            const { getAllByText, getByText } = renderScreen();

            await waitFor(() => {
                expect(getAllByText('Office Day')).toHaveLength(7);
                expect(getByText('Time Off')).toBeTruthy();
                expect(getAllByText('Delete')).toHaveLength(8); // 7 office + 1 time off
            });
        });

        it('should sort all events by date descending', async () => {
            const { getAllByText } = renderScreen();

            await waitFor(() => {
                const deleteButtons = getAllByText('Delete');
                // First item should be Apr 17 (most recent)
                fireEvent.press(deleteButtons[0]);
                expect(mockOnDelete).toHaveBeenCalledWith(
                    'od-apr-17',
                    expect.any(Date)
                );
            });
        });

        it('should show empty state when no events', async () => {
            const { getByText, queryByText } = renderScreen(NO_EVENTS, NO_EVENTS);

            await waitFor(() => {
                expect(getByText('No events logged yet')).toBeTruthy();
                expect(queryByText('Office Day')).toBeNull();
                expect(queryByText('Time Off')).toBeNull();
                expect(queryByText('Delete')).toBeNull();
            });
        });
    });

    describe('Duplicate detection', () => {
        it('should NOT flag unique office days as duplicates when mixed with time off', async () => {
            // This is the critical bug regression test:
            // 7 unique office days + 1 time off should show 0 duplicates
            const { queryByText } = renderScreen();

            await waitFor(() => {
                expect(queryByText('Duplicate Entry')).toBeNull();
            });
        });

        it('should NOT flag any entry as duplicate when there is one office day and one time off', async () => {
            const singleOffice = [APRIL_2026_OFFICE_DAYS[0]];
            const singleTimeOff = [APRIL_2026_TIME_OFF[0]];

            const { queryByText, getByText } = renderScreen(singleOffice, singleTimeOff);

            await waitFor(() => {
                expect(getByText('Office Day')).toBeTruthy();
                expect(getByText('Time Off')).toBeTruthy();
                expect(queryByText('Duplicate Entry')).toBeNull();
            });
        });

        it('should flag real duplicates — two office days on the same date', async () => {
            const { getAllByText } = renderScreen(DUPLICATE_OFFICE_DAYS, NO_EVENTS);

            await waitFor(() => {
                // Apr 8 has 2 entries → both flagged as duplicate
                const dupeLabels = getAllByText('Duplicate Entry');
                expect(dupeLabels).toHaveLength(2);
            });
        });

        it('should not flag non-duplicate alongside real duplicates', async () => {
            const { getAllByText } = renderScreen(DUPLICATE_OFFICE_DAYS, NO_EVENTS);

            await waitFor(() => {
                // 3 total events, 2 are dupes (Apr 8), 1 is unique (Apr 10)
                expect(getAllByText('Office Day')).toHaveLength(3);
                expect(getAllByText('Duplicate Entry')).toHaveLength(2);
                expect(getAllByText('Delete')).toHaveLength(3);
            });
        });

        it('should not flag office days as duplicates when time off exists on a different date', async () => {
            // Office day on Apr 8, time off on Apr 14 — no overlap, no duplicates
            const office = [APRIL_2026_OFFICE_DAYS[2]]; // Apr 8
            const timeOff = [APRIL_2026_TIME_OFF[0]]; // Apr 14

            const { queryByText, getByText } = renderScreen(office, timeOff);

            await waitFor(() => {
                expect(getByText('Office Day')).toBeTruthy();
                expect(getByText('Time Off')).toBeTruthy();
                expect(queryByText('Duplicate Entry')).toBeNull();
            });
        });
    });

    describe('Navigation', () => {
        it('should call onBack when back button is pressed', async () => {
            const { getByText } = renderScreen();

            await waitFor(() => {
                expect(getByText('Back')).toBeTruthy();
            });

            fireEvent.press(getByText('Back'));
            expect(mockOnBack).toHaveBeenCalledTimes(1);
        });
    });

    describe('Event deletion', () => {
        it('should delete an office day', async () => {
            const office = [APRIL_2026_OFFICE_DAYS[0]]; // Apr 2

            const { getAllByText } = renderScreen(office, NO_EVENTS);

            await waitFor(() => {
                const deleteButtons = getAllByText('Delete');
                fireEvent.press(deleteButtons[0]);
                expect(mockOnDelete).toHaveBeenCalledWith(
                    'od-apr-02',
                    expect.any(Date)
                );
            });
        });

        it('should delete a time off entry', async () => {
            const { getAllByText } = renderScreen(NO_EVENTS, APRIL_2026_TIME_OFF);

            await waitFor(() => {
                const deleteButtons = getAllByText('Delete');
                fireEvent.press(deleteButtons[0]);
                expect(mockOnDelete).toHaveBeenCalledWith(
                    'to-apr-14',
                    expect.any(Date)
                );
            });
        });

        it('should delete the correct event from a mixed list', async () => {
            // 7 office + 1 time off, sorted desc: Apr 17, 16, 15, 14(TO), 10, 8, 6, 2
            const { getAllByText } = renderScreen();

            await waitFor(() => {
                const deleteButtons = getAllByText('Delete');
                // Delete the 4th item (index 3) — should be the time off on Apr 14
                fireEvent.press(deleteButtons[3]);
                expect(mockOnDelete).toHaveBeenCalledWith(
                    'to-apr-14',
                    expect.any(Date)
                );
            });
        });
    });

    describe('Edge cases', () => {
        it('should handle only time off entries, no office days', async () => {
            const { getByText, queryByText } = renderScreen(NO_EVENTS, APRIL_2026_TIME_OFF);

            await waitFor(() => {
                expect(getByText('Time Off')).toBeTruthy();
                expect(queryByText('Office Day')).toBeNull();
                expect(queryByText('Duplicate Entry')).toBeNull();
            });
        });

        it('should handle many office days without false duplicates', async () => {
            const manyEvents = Array.from({ length: 10 }, (_, i) => ({
                id: `od-${i}`,
                title: 'Office Day' as const,
                startDate: new Date(2026, 2, i + 1), // March 1-10
                endDate: new Date(2026, 2, i + 2),
            }));

            const { queryByText, getAllByText } = renderScreen(manyEvents, APRIL_2026_TIME_OFF);

            await waitFor(() => {
                // FlatList may not render all items; verify no false duplicates in what's visible
                expect(getAllByText('Office Day').length).toBeGreaterThanOrEqual(1);
                expect(queryByText('Duplicate Entry')).toBeNull();
            });
        });
    });
});

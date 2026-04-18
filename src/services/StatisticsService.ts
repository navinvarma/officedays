import { PeriodStats, QuarterConfig, StatisticsPeriod } from '../types';

export class StatisticsService {
    // Default quarter configuration (standard calendar year)
    private static defaultQuarterConfig: QuarterConfig = {
        Q1: [0, 1, 2],   // January, February, March
        Q2: [3, 4, 5],   // April, May, June
        Q3: [6, 7, 8],   // July, August, September
        Q4: [9, 10, 11]  // October, November, December
    };

    /**
     * Get the quarter configuration
     */
    static getQuarterConfig(): QuarterConfig {
        return this.defaultQuarterConfig;
    }

    /**
     * Set custom quarter configuration
     */
    static setQuarterConfig(config: QuarterConfig): void {
        this.defaultQuarterConfig = config;
    }

    /**
     * Calculate working days (Monday to Friday) between two dates
     */
    static calculateWorkingDays(startDate: Date, endDate: Date): number {
        let workingDays = 0;

        // Handle UTC dates properly by using UTC methods
        const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
        const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

        // Loop through each day from start to end (inclusive)
        const current = new Date(start);
        while (current <= end) {
            const dayOfWeek = current.getUTCDay();
            // Monday = 1, Tuesday = 2, ..., Friday = 5
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                workingDays++;
            }
            current.setUTCDate(current.getUTCDate() + 1);
        }

        return workingDays;
    }

    /**
     * Calculate statistics for a specific month
     */
    static calculateMonthStats(year: number, month: number, officeDays: Date[], timeOffDays: Date[] = []): PeriodStats {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // Last day of month

        const workingDays = this.calculateWorkingDays(startDate, endDate);

        // Count office days in this month
        const officeDaysInMonth = officeDays.filter(date => {
            // Use UTC methods for consistent date comparison
            return date.getUTCFullYear() === year && date.getUTCMonth() === month;
        }).length;

        // Count time off days in this month
        const timeOffDaysInMonth = timeOffDays.filter(date => {
            return date.getUTCFullYear() === year && date.getUTCMonth() === month;
        }).length;

        const effectiveWorkingDays = workingDays - timeOffDaysInMonth;
        const percentage = effectiveWorkingDays > 0 ? Math.round((officeDaysInMonth / effectiveWorkingDays) * 100) : 0;

        return {
            workingDays,
            officeDays: officeDaysInMonth,
            timeOffDays: timeOffDaysInMonth,
            percentage,
            period: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
    }

    /**
     * Calculate statistics for a specific quarter
     */
    static calculateQuarterStats(year: number, quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4', officeDays: Date[], timeOffDays: Date[] = []): PeriodStats {
        const config = this.getQuarterConfig();
        const months = config[quarter];

        if (!months || months.length === 0) {
            throw new Error(`Invalid quarter: ${quarter}`);
        }

        // Sum working days per month individually to handle non-contiguous months
        // (e.g., Q4 = [10, 11, 0] wrapping Nov, Dec, Jan)
        let workingDays = 0;
        for (const month of months) {
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);
            workingDays += this.calculateWorkingDays(monthStart, monthEnd);
        }

        // Count office days in this quarter
        const officeDaysInQuarter = officeDays.filter(date => {
            // Use UTC methods for consistent date comparison
            return date.getUTCFullYear() === year && months.includes(date.getUTCMonth());
        }).length;

        // Count time off days in this quarter
        const timeOffDaysInQuarter = timeOffDays.filter(date => {
            return date.getUTCFullYear() === year && months.includes(date.getUTCMonth());
        }).length;

        const effectiveWorkingDays = workingDays - timeOffDaysInQuarter;
        const percentage = effectiveWorkingDays > 0 ? Math.round((officeDaysInQuarter / effectiveWorkingDays) * 100) : 0;

        return {
            workingDays,
            officeDays: officeDaysInQuarter,
            timeOffDays: timeOffDaysInQuarter,
            percentage,
            period: `${quarter} ${year}`
        };
    }

    /**
     * Calculate statistics for a specific year
     */
    static calculateYearStats(year: number, officeDays: Date[], timeOffDays: Date[] = []): PeriodStats {
        const startDate = new Date(year, 0, 1); // January 1st
        const endDate = new Date(year, 11, 31); // December 31st

        const workingDays = this.calculateWorkingDays(startDate, endDate);

        // Count office days in this year
        const officeDaysInYear = officeDays.filter(date => {
            // Use UTC methods for consistent date comparison
            return date.getUTCFullYear() === year;
        }).length;

        // Count time off days in this year
        const timeOffDaysInYear = timeOffDays.filter(date => {
            return date.getUTCFullYear() === year;
        }).length;

        const effectiveWorkingDays = workingDays - timeOffDaysInYear;
        const percentage = effectiveWorkingDays > 0 ? Math.round((officeDaysInYear / effectiveWorkingDays) * 100) : 0;

        return {
            workingDays,
            officeDays: officeDaysInYear,
            timeOffDays: timeOffDaysInYear,
            percentage,
            period: year.toString()
        };
    }

    /**
     * Get available years from office days data
     */
    static getAvailableYears(officeDays: Date[]): number[] {
        const years = new Set(officeDays.map(date => date.getUTCFullYear()));
        return Array.from(years).sort((a, b) => b - a); // Sort descending
    }

    /**
     * Get available months for a specific year
     */
    static getAvailableMonths(year: number, officeDays: Date[]): number[] {
        const months = new Set(
            officeDays
                .filter(date => date.getUTCFullYear() === year)
                .map(date => date.getUTCMonth())
        );
        return Array.from(months).sort((a, b) => a - b); // Sort ascending
    }

    /**
     * Get month name from month number
     */
    static getMonthName(month: number): string {
        const date = new Date(2024, month, 1); // Use 2024 as it's a leap year
        return date.toLocaleDateString('en-US', { month: 'long' });
    }

    /**
     * Get quarter name from month number
     */
    static getQuarterFromMonth(month: number): string {
        const config = this.getQuarterConfig();

        if (config.Q1.includes(month)) return 'Q1';
        if (config.Q2.includes(month)) return 'Q2';
        if (config.Q3.includes(month)) return 'Q3';
        if (config.Q4.includes(month)) return 'Q4';

        return 'Unknown';
    }

    /**
     * Calculate statistics for a custom date range
     */
    static calculateCustomPeriodStats(startDate: Date, endDate: Date, officeDays: Date[], timeOffDays: Date[] = []): PeriodStats {
        const workingDays = this.calculateWorkingDays(startDate, endDate);

        // Count office days in this range
        const officeDaysInRange = officeDays.filter(date => {
            return date >= startDate && date <= endDate;
        }).length;

        // Count time off days in this range
        const timeOffDaysInRange = timeOffDays.filter(date => {
            return date >= startDate && date <= endDate;
        }).length;

        const effectiveWorkingDays = workingDays - timeOffDaysInRange;
        const percentage = effectiveWorkingDays > 0 ? Math.round((officeDaysInRange / effectiveWorkingDays) * 100) : 0;

        const period = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

        return {
            workingDays,
            officeDays: officeDaysInRange,
            timeOffDays: timeOffDaysInRange,
            percentage,
            period
        };
    }
}

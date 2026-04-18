# Office Days 📅

A personal, non-commercial open-source mobile application built with React Native and Expo for tracking office attendance with calendar integration, event management, and comprehensive attendance statistics.

## 📋 Table of Contents

- [✨ Features](#-features) • [📸 Screenshots](#-screenshots) • [🚀 Building Locally](#-building-locally) • [📱 Installing on Your Phone](#-installing-on-your-phone) • [🧪 Testing](#-testing) • [🛠️ Tech Stack](#️-tech-stack) • [📄 License](#-license) • [🔒 Privacy](#-privacy)

## 🎯 Project Overview

**Office Days** is a modern React Native mobile application that helps you track your office attendance. Built with Expo SDK and TypeScript, it features a calendar interface, comprehensive statistics, and seamless calendar integration.

This is a **personal, non-commercial open-source project**. All data is stored locally on your device and the app operates entirely offline.

### Key Features
- Custom calendar widget with date selection
- Calendar integration for event storage
- Log office days and time off (vacation, sick, bereavement, etc.)
- Time off excluded from attendance percentage calculation
- Past event management with delete functionality
- Enhanced Statistics with Period Analysis
- Configurable Quarter Definitions
- Historical Data Analysis
- Real-time calendar highlighting
- Three theme options (Light, Dark, Sand)
- Daily reminder notifications

## 🚀 Building Locally

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- [Expo Go app](https://expo.dev/client) on your mobile device (for development)
- Android Studio (for building Android APK)
- Xcode (for building iOS app, macOS only)

### Setup

```bash
# Clone the repository
git clone https://github.com/navinvarma/officedays.git
cd officedays

# Install dependencies
npm install

# Start the development server
npx expo start
```

Scan the QR code with Expo Go to run the app on your device during development.

## 📱 Installing on Your Phone

### Building an Android APK with Expo

To create an APK file that you can install directly on your Android device:

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS Build** (if not already configured):
   ```bash
   eas build:configure
   ```

4. **Build Android APK**:
   ```bash
   eas build --platform android --profile preview
   ```
   
   Or for a production build:
   ```bash
   eas build --platform android
   ```

5. **Download and Install**:
   - Once the build completes, EAS will provide a download link
   - Download the APK file to your Android device
   - Enable "Install from unknown sources" in your Android settings
   - Open the APK file and install

### Alternative: Local Build with Expo

You can also build locally using Expo's build tools:

```bash
# Build Android APK locally
npx expo build:android -t apk
```

### Building for iOS

For iOS, you'll need an Apple Developer account:

```bash
eas build --platform ios
```

## ✨ Features

- **🗓️ Smart Calendar Widget**: Interactive monthly calendar with color-coded indicators for today, office days, and time off
- **📱 One-Tap Logging**: Log office days or time off directly to your default calendar with timezone handling
- **🏖️ Time Off Tracking**: Log vacation, sick days, bereavement, or any absence — automatically excluded from attendance calculations
- **📊 Statistics Dashboard**: 
  - **Attendance Percentage**: `Office Days / (Working Days - Time Off) × 100%` — time off doesn't penalize your rate
  - **Period Analysis**: View statistics for any month, quarter, or year
  - **Configurable Quarters**: Customize which months belong to Q1, Q2, Q3, Q4 (supports non-standard fiscal years)
  - **Historical Data**: Analyze attendance patterns across different time periods
  - **Color-coded stat cards**: Working days, office days, time off (amber), and attendance (green)
- **🗂️ Past Event Management**: Combined list of office days and time off with delete support
- **🎨 Theme System**: Light, Dark, and Sand themes with glass morphism, gradient backgrounds, and theme-aware shadows
- **🔔 Reminder Notifications**: Configurable daily reminders with day-of-week and time selection
- **📅 Historical Access**: Navigate and log events for the past 6 months

### Statistics Details

#### **Attendance Formula**
Time off reduces the denominator, not the numerator. If a month has 22 working days, 3 time off days, and 10 office days: `10 / (22 - 3) = 53%` instead of `10 / 22 = 45%`.

#### **Flexible Quarter Configuration**
- Default: Standard calendar quarters (Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec)
- Customizable: Define which months belong to each quarter
- Supports non-contiguous months (e.g., Q4: Nov, Dec, Jan for fiscal years)

## 📸 Screenshots

Want to see the app in action? Check out our comprehensive screenshot gallery showcasing all the major features and UI components.

**[📱 View All Screenshots →](SCREENSHOTS.md)**

The screenshots demonstrate:
- Main interface and date selection
- Custom calendar widget with visual indicators
- Past office days management
- **Enhanced Statistics Dashboard** with period selection
- **Quarter Configuration Interface**
- **Historical Period Analysis**
- Menu navigation and modal interactions

## 🏗️ Development Story

Started as a weekend project built with Cursor AI. Later revived and extended with Claude Code — adding the theme system, time off tracking, notification reminders, and comprehensive test coverage (196 tests). A good example of iterating on an AI-assisted codebase across different tools.

## 📱 Manual Testing

**Core Flow**: Log office day → Log time off → Check calendar integration → View past events → Verify statistics (time off excluded) → Switch themes → Configure reminders

**Edge Cases**: Permission denial, duplicate logging prevention, office day + time off conflict on same date, quarter configuration with wrap-around months, theme persistence across restarts

## 🧪 Testing

**Coverage**: 196 passing tests across 10 test suites

```bash
npm test                    # Run all tests
npm run test:coverage      # Coverage report
```

### Test Coverage Areas
- **StatisticsService** (31 tests): Working days, month/quarter/year stats, time off subtraction, custom quarter configs, non-contiguous month handling, custom date ranges
- **MainScreen** (24 tests): Date logging, past event retrieval, calendar highlighting, date validation, data consistency, UTC handling
- **StatisticsScreen** (25 tests): Period type switching, year/month/quarter selection, time off display, stat card rendering, quarter configuration
- **PastOfficeDaysScreen** (19 tests): Event display, deletion, time off entries, date formatting, edge cases
- **SettingsScreen** (47 tests): Theme selection, notification toggle, time picker, day selection
- **NotificationService** (22 tests): Permissions, preferences, scheduling, time formatting
- **Theme system** (60 tests): Theme definitions, context provider, persistence, error recovery
- **MonthStats** (2 tests): Integration tests for monthly statistics via MainScreen

## 🛠️ Tech Stack

**Core**: React Native 0.81, Expo SDK 54, TypeScript 5.9, React 19.1

**Storage**: expo-calendar (events), AsyncStorage (preferences), expo-notifications (reminders)

**Testing**: Jest 29, @testing-library/react-native 12 (196 tests)

**Architecture**: Single-screen app with state-based navigation, custom calendar widget, theme system (light/dark/sand), statistics service with time off support

## 🔮 Future Enhancements

Location-based logging • Team analytics • Custom categories • Export reports • Data visualization charts

## 🤝 Contributing

Fork → Create feature branch → Add tests → Submit PR

**Testing Requirements**: All new features must include comprehensive test coverage for both unit and integration testing.

## 📄 License

**Apache License 2.0** - See [LICENSE](LICENSE) for details.

## 🔒 Privacy

Office Days is a free, offline application. All data is stored locally on your device. We do not collect, store, or transmit any personal data. See [PRIVACY.md](PRIVACY.md) for more information.

---

**Built with ❤️ using AI-assisted development** (Cursor + Claude Code)

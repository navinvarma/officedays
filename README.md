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
- Past event management with delete functionality
- Enhanced Statistics with Period Analysis
- Configurable Quarter Definitions
- Historical Data Analysis
- Real-time calendar highlighting

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

- **🗓️ Smart Calendar Widget**: Interactive monthly calendar with date selection and visual indicators
- **📱 One-Tap Logging**: Log office days directly to your default calendar with timezone handling
- **📊 Enhanced Statistics Dashboard**: 
  - **Current Month Statistics**: Track working days vs. office days with attendance percentage
  - **Period Analysis**: View statistics for any month, quarter, or year
  - **Configurable Quarters**: Customize which months belong to Q1, Q2, Q3, Q4
  - **Historical Data**: Analyze attendance patterns across different time periods
- **🗂️ Past Event Management**: View, navigate, and delete previously logged office days
- **🎨 Real-time Updates**: Calendar highlighting updates immediately after logging
- **📅 Historical Access**: Navigate and log office days for the past 6 months
- **⚡ Modern UI**: Clean interface with smooth animations and modal navigation

### 🆕 Enhanced Statistics Features

#### **Period Type Selection**
- **Month**: Analyze specific months with detailed working days calculation
- **Quarter**: View quarterly statistics with configurable month groupings
- **Year**: Get annual overview of attendance patterns

#### **Flexible Quarter Configuration**
- Default: Standard calendar quarters (Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec)
- Customizable: Define which 3 months belong to each quarter
- Perfect for fiscal year planning and custom business cycles

#### **Historical Period Analysis**
- **Year Selection**: Choose any year with logged office days
- **Month Selection**: Pick any month (January through December) for analysis
- **Quarter Selection**: Select Q1, Q2, Q3, or Q4 for quarterly insights
- **Working Days Calculation**: Accurate Monday-Friday counting for any period
- **Attendance Percentage**: Real-time calculation of (Office Days / Working Days) × 100%

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

Built as a fun weekend project using React Native, Expo, and Cursor AI assistance. The result? A fully-featured office tracking app with **comprehensive statistics and historical analysis** completed in just a few hours of focused coding - demonstrating how AI tooling can amplify human creativity and productivity! 🚀

## 📱 Manual Testing

**Core Features**: Log office days → Check calendar integration → Test date picker navigation → View past events → **Test Enhanced Statistics** → **Configure Quarters** → **Analyze Historical Periods** → Verify calendar highlighting

**Edge Cases**: Test permission denial, network issues, date boundaries, duplicate logging scenarios, **quarter configuration changes**, **period type switching**

## 🧪 Testing

**Coverage**: Comprehensive test suite with 54 passing tests
- **CalendarService**: 100% coverage (initialization, permissions, event management)
- **MainScreen**: Full coverage (UI interactions, date handling, statistics)
- **StatisticsService**: 100% coverage (period calculations, quarter configuration, working days)
- **Enhanced Statistics**: Complete test coverage for new features

```bash
npm test                    # Run all tests
npm run test:coverage      # Coverage report
```

### Test Coverage Areas
- **Core Functionality**: Calendar integration, event management, date handling
- **Statistics Calculations**: Working days, office days, attendance percentages
- **Period Analysis**: Month, quarter, and year statistics
- **Quarter Configuration**: Custom quarter definitions and validation
- **UI Interactions**: Period type selection, year/month/quarter pickers
- **Data Consistency**: UTC handling, timezone conversions, date filtering

## 🛠️ Tech Stack

**Core**: React Native, Expo SDK 53, TypeScript, Expo Calendar, Jest + Testing Library

**Architecture**: Single-screen app with modal navigation, custom calendar widget, **comprehensive statistics service**, and extensive test suite

**New Components**: 
- **StatisticsService**: Centralized statistics calculation engine
- **Enhanced UI Components**: Period selection, quarter configuration, historical analysis
- **Advanced Date Handling**: UTC consistency, working days calculation, period filtering

## 🔮 Future Enhancements

Location-based logging • Team analytics • Custom categories • Export reports • Offline support • **Advanced Analytics Dashboard** • **Custom Period Definitions** • **Data Visualization Charts**

## 🤝 Contributing

Fork → Create feature branch → Add tests → Submit PR

**Testing Requirements**: All new features must include comprehensive test coverage for both unit and integration testing.

## 📄 License

**Apache License 2.0** - See [LICENSE](LICENSE) for details.

## 🔒 Privacy

Office Days is a free, offline application. All data is stored locally on your device. We do not collect, store, or transmit any personal data. See [PRIVACY.md](PRIVACY.md) for more information.

---

**Built with ❤️ using Cursor AI** - This project demonstrates the power of combining human creativity with AI assistance for rapid, high-quality development. What will you build next? 🚀

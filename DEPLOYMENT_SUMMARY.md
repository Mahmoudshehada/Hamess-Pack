# Hamess Pack: Deployment & Installation Summary

## 1. Prerequisites & Accounts

Before deployment, ensure you possess the following accounts and credentials:

*   **Google Play Console:** One-time fee ($25). Required for Android distribution.
*   **Apple Developer Program:** Annual fee ($99). Required for iOS App Store and TestFlight.
*   **Firebase Console:** Free tier sufficient. Required for managing Push Notifications (FCM) on both platforms.
*   **Twilio Account:** Paid per message. Required for the WhatsApp Admin Alert system.
*   **Web Hosting:** Vercel, Netlify, or AWS. Required to host the backend API and the Desktop PWA version.

---

## 2. Developer Build Guide (How to Compile)

To turn the provided React source code into installable apps, you must use **Capacitor**. Run the following commands in your terminal:

### A. Initial Setup
```bash
# 1. Install Dependencies
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# 2. Initialize Capacitor (Use your own App Name and ID)
npx cap init "Hamess Pack" com.hamesspack.admin

# 3. Build the Web App
npm run build
```

### B. Android Build
```bash
# 1. Add Android Platform
npx cap add android

# 2. Sync Web Build to Android
npx cap sync

# 3. Open in Android Studio to Build APK/Bundle
npx cap open android
```
*Inside Android Studio: Go to `Build > Generate Signed Bundle / APK` to create the file for Google Play.*

### C. iOS Build (Mac Only)
```bash
# 1. Add iOS Platform
npx cap add ios

# 2. Sync Web Build to iOS
npx cap sync

# 3. Open in Xcode
npx cap open ios
```
*Inside Xcode: Select your target device as "Any iOS Device (arm64)" and go to `Product > Archive` to upload to TestFlight.*

---

## 3. Android Deployment (Google Play)

**Publishing Steps:**
1.  Create a new app in Google Play Console.
2.  Upload the `.aab` file generated from Android Studio.
3.  Complete the Store Listing (Screenshots, Description, Logo).
4.  Complete the Data Safety form (disclose that you collect User IDs and Phone numbers).
5.  Submit for Review (Usually takes 24-48 hours).

---

## 4. iPhone Deployment (iOS)

**IMPORTANT:** iOS prevents direct file downloads from websites. You CANNOT just "download" the app like on Android. You must use one of the methods below:

**A. TestFlight (For Beta/Internal Use):**
1.  **Archive:** In Xcode, select "Any iOS Device" and run "Product > Archive".
2.  **Upload:** Validate and upload the build to **App Store Connect**.
3.  **Invite:** In App Store Connect, go to TestFlight and add your email.
4.  **Install:** Open the "TestFlight" app on your iPhone and accept the invite.

**B. App Store (For Public Use):**
1.  Submit the build from TestFlight to "Review".
2.  Once approved, the app will have a public URL on the App Store.

**C. Web App / PWA (Immediate No-Code Solution):**
1.  Open the website in **Safari**.
2.  Tap the **Share** icon (square with arrow).
3.  Scroll down and tap **Add to Home Screen**.
4.  This creates an app icon that works exactly like the native app (full screen, no browser bars).

---

## 5. Desktop Deployment (Web/PWA)

**Build Process:**
1.  Run `npm run build`.
2.  Upload the `dist` or `build` folder to your hosting provider (e.g., Vercel).

**Desktop App (Optional):**
For a standalone feel without using a browser bar:
1.  Users navigate to the website in Chrome or Edge.
2.  Click the "Install Hamess Pack" icon in the address bar.
3.  The app installs to the OS (Windows/Mac) and creates a desktop shortcut, launching in its own window.

---

## 6. Notifications Setup

### A. Push Notifications (FCM & APNs)
To send popup alerts to the mobile apps:
1.  **Firebase:** Create a project. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) and place them in the respective project folders.
2.  **Apple Bridge:** In Apple Developer Portal, generate an **APNs Key** (.p8 file). Upload this key to Firebase Project Settings. This allows Firebase to talk to iPhones.
3.  **App Logic:** When the app opens, it asks for permission. If granted, it generates a "Device Token" and sends it to your database.

### B. WhatsApp Alerts (Admin Only)
These are *not* push notifications; they are chat messages sent via Twilio.
1.  **Trigger:** When an order is placed (High Value or Critical Stock), the backend detects the event.
2.  **Logic:** The backend calls the Twilio API.
3.  **Delivery:** Twilio sends a pre-templated message to the specific Admin phone numbers (Walid/Mahmoud) defined in the system config.

---

## 7. Installation Guide (End-User)

*   **Admins (Android):** Download "Hamess Pack Admin" from Google Play Store.
*   **Admins (iOS):**
    *   *Testing:* Install "TestFlight" from App Store, accept email invite, install Hamess Pack.
    *   *Live:* Download "Hamess Pack Admin" from App Store.
    *   *Fast:* Use the "Add to Home Screen" feature in Safari.
*   **Admins (Desktop):** Go to admin URL -> Click "Install" in browser bar -> Open from Desktop Shortcut.

---

## 8. Troubleshooting

**Q: Why does the iOS 'Download' button do nothing?**
A: iOS security blocks direct downloads. You must set up TestFlight (Method A above) or use the "Add to Home Screen" feature (Method C).

**Q: Why do new products disappear on refresh?**
A: Ensure you are using the IndexedDB version of the storage logic (this is enabled by default in the new build). Check the "System Health" tab in Admin to confirm "Persistence Mode" is IndexedDB.

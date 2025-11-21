# Hamess Pack: Deployment & Installation Summary

## 1. Prerequisites & Accounts

Before deployment, ensure you possess the following accounts and credentials:

*   **Google Play Console:** One-time fee ($25). Required for Android distribution.
*   **Apple Developer Program:** Annual fee ($99). Required for iOS App Store and TestFlight.
*   **Firebase Console:** Free tier sufficient. Required for managing Push Notifications (FCM) on both platforms.
*   **Twilio Account:** Paid per message. Required for the WhatsApp Admin Alert system.
*   **Web Hosting:** Vercel, Netlify, or AWS. Required to host the backend API and the Desktop PWA version.

---

## 2. Android Deployment (Google Play)

**Build Process:**
1.  **Sync:** Build the React web project and sync the assets to the Android native project folder (using Capacitor).
2.  **Configuration:** Update `AndroidManifest.xml` with your App Name, Package ID (e.g., `com.hamesspack.admin`), and Version Code.
3.  **Signing:** Generate a **Keystore file** (`.jks`). *Crucial: Back this up securely. If lost, you cannot update the app.*
4.  **Build Artifact:** Generate a **Signed App Bundle (.aab)**. Do not use APKs for the Play Store.

**Publishing Steps:**
1.  Create a new app in Google Play Console.
2.  Upload the `.aab` file to the "Internal Testing" or "Production" track.
3.  Complete the Store Listing (Screenshots, Description, Logo).
4.  Complete the Data Safety form (disclose that you collect User IDs and Phone numbers).
5.  Submit for Review (Usually takes 24-48 hours).

---

## 3. iPhone Deployment (iOS)

**Build Process:**
1.  **Sync:** Build the React web project and sync assets to the iOS native project folder.
2.  **Xcode:** Open the project in Xcode.
3.  **Signing:** Log in with your Apple Developer ID. Xcode will automatically manage the **Provisioning Profiles** and **Distribution Certificates**.
4.  **Privacy Manifest:** Ensure the `PrivacyInfo.xcprivacy` file is present (required by Apple to declare data usage).

**Publishing Steps:**
1.  **Archive:** In Xcode, select "Any iOS Device" and run "Product > Archive".
2.  **Upload:** Validate and upload the build to **App Store Connect**.
3.  **TestFlight:** Once processed, the build appears in TestFlight. Add your email to "Internal Testing" to install it immediately on your phone.
4.  **App Store:** When ready, move the TestFlight build to "Production," fill out the store metadata, and submit for Review (24-48 hours).

---

## 4. Desktop Deployment (Web/PWA)

**Build Process:**
1.  Run the standard React build command to generate static files.
2.  Upload these files to your hosting provider (e.g., Vercel).

**Desktop App (Optional):**
For a standalone feel without using a browser bar:
1.  Users navigate to the website in Chrome or Edge.
2.  Click the "Install Hamess Pack" icon in the address bar.
3.  The app installs to the OS (Windows/Mac) and creates a desktop shortcut, launching in its own window.

---

## 5. Notifications Setup

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

## 6. Installation Guide (End-User)

*   **Admins (Android):** Download "Hamess Pack Admin" from Google Play Store.
*   **Admins (iOS):**
    *   *Testing:* Install "TestFlight" from App Store, accept email invite, install Hamess Pack.
    *   *Live:* Download "Hamess Pack Admin" from App Store.
*   **Admins (Desktop):** Go to admin URL -> Click "Install" in browser bar -> Open from Desktop Shortcut.

---

## 7. iOS Limitations

*   **Web Push:** If using the web version (Safari) instead of the App Store version, push notifications are only supported on iOS 16.4+ and *only* if the user adds the app to their Home Screen.
*   **App Store Review:** Apple often rejects "Web Wrappers" (apps that are just a website). To avoid rejection, ensure the app uses native features (Push Notifications, Camera for uploads) and provides a seamless, app-like UI (no footer credits, smooth navigation).

---

## 8. Post-Deployment Test Checklist

1.  [ ] **Install:** Can you download and install the app from the Store/TestFlight?
2.  [ ] **Login:** Does the OTP/Password login work?
3.  [ ] **Stock:** Do products load from the database?
4.  [ ] **Push:** Send a test notification from the Admin Panel. Does it appear on the phone lock screen?
5.  [ ] **WhatsApp:** Place a high-value order. Does the Admin receive a WhatsApp message?
6.  [ ] **Camera:** Can you upload a product image using the phone camera?
7.  [ ] **Offline:** Turn on Airplane Mode. Can you still browse products (cached)?

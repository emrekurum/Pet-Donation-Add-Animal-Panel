# Social Donation Admin Panel

## 🌟 Project Description

This is the admin panel for the "Sosyal Bağış Platformu" (Social Donation Platform). It allows administrators to manage shelters, animals available for virtual adoption and donation, and configure donation item prices. The panel is built with React, TypeScript, Vite, and Firebase for backend services.

## ✨ Features

Currently, the admin panel supports the following functionalities:

* **Shelter Management:**
    * Add new animal shelters to the platform.
    * (Future: List, Edit, and Delete existing shelters).
* **Animal Management:**
    * Add new animals to specific shelters.
    * (Future: List, Edit, and Delete existing animals).
* **Donation Item Price Management:**
    * Set and update unit prices for standard donation items (e.g., Food, Toys, Medicine). These prices are then used in the mobile application.
* **Donation Viewing (Per Animal):**
    * View a list of all donations made for a specific animal.
* **Firebase Integration:**
    * Uses Firebase Firestore as the database.
    * (Future: Firebase Authentication for admin login).
    * (Future: Firebase Storage for image uploads - currently uses URL input).

## 🛠️ Tech Stack

* **Frontend:**
    * React
    * TypeScript
    * Vite (Build tool)
* **Backend & Database:**
    * Firebase (Firestore, Authentication, Storage - Storage planned)
* **Styling:**
    * Inline Styles / CSS (as per current implementation)

## 🚀 Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd sosyal-bagis-admin
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Firebase:**
    * Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    * Enable **Firestore Database**.
    * Enable **Authentication** (Email/Password provider for admin login).
    * (Optional for now, as we are using URLs) Enable **Storage** if you plan to implement direct file uploads.
    * Obtain your Firebase project configuration credentials.

4.  **Environment Variables:**
    * Create a `.env` file in the root of your admin panel project (`sosyal-bagis-admin/.env`).
    * Add your Firebase project configuration to the `.env` file. The variables should be prefixed with `VITE_` as per Vite's convention:
        ```env
        VITE_FIREBASE_API_KEY=YOUR_API_KEY
        VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
        VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
        VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
        VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
        VITE_FIREBASE_APP_ID=YOUR_APP_ID
        VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID (Optional)
        ```
    * Replace `YOUR_...` with your actual Firebase project credentials.

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application should now be running, typically on `http://localhost:5173` (or another port specified by Vite).

## ⚙️ Usage

1.  **Firebase Console Setup:**
    * Ensure you have created at least one admin user in the Firebase Authentication console (Email/Password).
    * (Optional, for initial testing if client-side admin check is used) Add an `isAdmin: true` field to this user's document in your `users` collection in Firestore.
    * Create the `donationItemPrices` collection in Firestore and add documents for 'Mama', 'Oyuncak', 'İlaç' with `name` and `unitPrice` fields if you want to pre-populate prices. Otherwise, the Price Management form will use defaults and allow you to save them.

2.  **Accessing the Panel:**
    * Open the admin panel URL in your browser.
    * (Once login is implemented) Log in using the admin credentials you created in Firebase.

3.  **Managing Content:**
    * Use the navigation bar to switch between:
        * **Shelter Operations:** Add new shelters. View a list of existing shelters (listing and editing are future enhancements).
        * **Animal Operations:** Add new animals. View a list of existing animals (listing and editing are future enhancements).
        * **Price Management:** Update the unit costs for donation items like food, toys, and medicine.
    * Fill out the respective forms and submit to add or update data in Firebase.

## 🔮 Future Enhancements

* **Full Admin Authentication:** Implement a robust login system using Firebase Authentication.
* **List, Edit, and Delete Functionality:**
    * Allow admins to view lists of all shelters and animals.
    * Implement functionality to edit and delete existing shelters and animals.
* **Image Uploads:** Integrate Firebase Storage for direct image uploads instead of URL inputs.
* **Dashboard:** A main dashboard page summarizing key statistics (e.g., total animals, total shelters, recent donations).
* **Donation Management:** A dedicated section to view and manage all donations.
* **User Management:** (If applicable) A section to manage platform users.
* **Real-time Notifications:** Implement notifications for admins (e.g., when a new significant donation is made) using Firebase Cloud Functions.
* **Enhanced UI/UX:** Further improvements to the user interface and user experience.
* **Role-Based Access Control:** More granular permissions for different types of admin users (if needed).

##🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

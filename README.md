# KMFI-Web

A web portal for the Kenya Miller Fortification Index (KMFI), developed and maintained by TechnoServe. This application facilitates self-assessments, score tracking, and data reporting for food fortification compliance across Kenya's milling sector.

---

## 🌐 Live Site

**[https://selfassessment.kmfi-ke.org](https://selfassessment.kmfi-ke.org)**

---

## 📦 Repository

**[GitHub - TechnoServe/KMFI-Web](https://github.com/TechnoServe/KMFI-Web.git)**

---

## 🚀 Features

- Secure user authentication
- Role-based access for admins, millers, and TNS reviewers
- Dynamic SAT (Self-Assessment Tool) forms
- Score computation and IVC data management
- Commenting and approval workflows
- Real-time updates via Firestore
- Google Sheets integration (restricted to admin)

---

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js (Firebase Functions)
- **Database:** Firestore (NoSQL)
- **Authentication:** Firebase Auth
- **Storage:** Firebase Cloud Storage
- **Email Service:** Brevo SMTP
- **Deployment:** Firebase Hosting

---

## 📁 Project Structure

```
KMFI-Web/
├── frontend/          # React-based frontend
├── functions/         # Firebase Functions backend (Node.js)
├── .env               # Environment variables
├── .firebaserc        # Firebase project config
└── README.md
```

---

## ⚙️ Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/TechnoServe/KMFI-Web.git
   cd MFI-Web
   ```

2. Install dependencies:

   - **Frontend:**

     ```bash
     cd frontend
     npm install
     ```

   - **Backend:**

     ```bash
     cd ../functions
     npm install
     ```

3. Use correct Node version:

   ```bash
   nvm use 18.18.0
   ```

   Make sure you're using Firebase CLI version 13.7.3:

   ```bash
   firebase --version
   # If needed, install a specific version:
   npm install -g firebase-tools@13.7.3
   ```

4. Start development servers:

   - **Frontend:**

     ```bash
     firebase serve --only hosting
     ```

   - **Backend (in root):**

     ```bash
     firebase emulators:start
     ```

---

## 🔐 Environment Setup

- Create `.env` in both `frontend/` and `functions/` with necessary variables.
- **Important:** Do **not** commit sensitive files like `auth-google-sheets.json`.

---

## 🧪 Testing

To be implemented.

---

## 📄 License

MIT License – see [`LICENSE`](./LICENSE) file for details.

---

## 📞 Contact

For questions or support, reach out to the TechnoServe Digital team.

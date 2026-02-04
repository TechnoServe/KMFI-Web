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
- **Backend:** Node.js 20 (Firebase Functions)
- **Functions Runtime:** nodejs20
- **Database:** Firestore (NoSQL)
- **Authentication:** Firebase Auth
- **Storage:** Firebase Cloud Storage
- **Email Service:** Brevo SMTP
- **Deployment:** Firebase Hosting

---

## 🔄 Old vs Current Setup (KMFI)

| Area | Old Setup | Current Setup |
|-----|----------|---------------|
| Functions Runtime | nodejs18 | nodejs20 |
| Local Node Version | Node 18.x | Node 20.18.2 |
| Firebase CLI | Unpinned | v15.4.0 (required) |
| Deployment Model | Firebase Functions (Gen 1) | Firebase Functions (Gen 1, upgraded runtime) |
| Architecture | Shared legacy assumptions | KMFI-isolated logic & database |
| Authentication | Firebase Auth (basic roles) | Firebase Auth (KMFI-specific access control) |

This upgrade modernizes the KMFI platform, improves security and performance, and aligns it with Firebase’s supported runtimes while maintaining backward compatibility with existing Gen 1 Functions.

---

## 🧩 Architecture Overview

See the full architecture diagram below and in docs/architecture.

![KMFI Architecture](docs/architecture/mfi-architecture.png)

---

## 📁 Project Structure

```
KMFI-Web/
├── frontend/          # React-based frontend
├── functions/         # Firebase Functions backend (Node.js)
├── docs/              # Architecture & technical documentation
├── docs/architecture/ # Architecture diagrams
├── .firebaserc        # Firebase project config
└── README.md
```

---

## ⚙️ Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/TechnoServe/KMFI-Web.git
   cd KMFI-Web
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
   nvm use 20.18.2
   ```

   Make sure you're using Firebase CLI version 15.4.0:

   ```bash
   firebase --version
   # If needed, install a specific version:
   npm install -g firebase-tools@15.4.0
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

## 📄 Documentation

- [docs/README.md](docs/README.md) (Documentation Index)
- [docs/TECH_TRAINING_MANUAL.md](docs/TECH_TRAINING_MANUAL.md)
- [docs/HANDOVER_TECHNICAL_DOCUMENT.md](docs/HANDOVER_TECHNICAL_DOCUMENT.md)
- [docs/DEPLOYMENT_RUNBOOK.md](docs/DEPLOYMENT_RUNBOOK.md)

Formal PDF/Word exports are available for client handover.

---

## 📄 License

MIT License – see [`LICENSE`](./LICENSE) file for details.

---

## 📞 Contact

For questions or support, reach out to the TechnoServe Digital team.



# 🚀 KMFI Deployment Runbook

This document provides **step-by-step, repeatable instructions** for deploying the KMFI platform to Firebase under the **ignite-program** Google Cloud project.

It is intended for:
- DevOps / Engineers
- Technical partners
- Handover & audit purposes

---

## 1️⃣ Prerequisites

### Local Environment
Ensure the following are installed **before deployment**:

- **Node.js**: `20.18.2`
- **Firebase CLI**: `15.4.0`
- **npm**: bundled with Node
- **jq** (for Auth migration / JSON processing)

Verify:
```bash
node -v
firebase --version
```

---

## 2️⃣ Firebase Project Setup

### Active Project
Set the active Firebase project:
```bash
firebase use ignite-program
```

Confirm:
```bash
firebase projects:list
```

---

## 3️⃣ Environment Variables (.env)

KMFI currently uses a `.env` file stored in the **functions** directory.

Location:
```
functions/.env
```

Required variables:
```
AUTH_FILE
PROJECT_ID
NODE_ENV
FRONTEND_URL
TRANSACTIONAL_EMAIL_ADDRESS
SMTP_USERNAME
SMTP_PASSWORD
SMTP_ENDPOINT
REPLY_TO_EMAIL
```

⚠️ **Do not commit `.env` to GitHub**

---

## 4️⃣ Firestore Database

### Database
- **Project**: kmfi-945ef
- **Database ID**: `kmfi`
- **Region**: `nam5`

Confirm at runtime:
```js
console.log(db._settings.projectId);
console.log(db._settings.databaseId);
```

---

## 5️⃣ Firestore Indexes

Indexes must be deployed **after data import**.

From repo root:
```bash
firebase deploy --only firestore:indexes --project ignite-program
```

Indexes are defined in:
```
firestore.indexes.json
```

---

## 6️⃣ Authentication (Firebase Auth)

### Auth Migration (if applicable)
- Users are imported via Firebase Auth CLI
- Passwords are **not preserved**
- KMFI access is controlled via **custom claims**

Example claim:
```json
{
  "apps": ["KMFI"]
}
```

---

## 7️⃣ Cloud Functions Deployment

### Runtime
- **Gen 1 Firebase Functions**
- **Runtime**: `nodejs20`
- **Region**: `us-central1`

Deploy functions only:
```bash
cd functions
npm install
firebase deploy --only functions --project ignite-program
```

If you encounter:
```
Could not detect runtime
```
Ensure `package.json` contains:
```json
"engines": { "node": "20" }
```

---

## 8️⃣ Frontend Build & Hosting

### Build Frontend
```bash
cd frontend
npm install
npm run build
```

### Deploy Hosting
```bash
firebase deploy --only hosting --project ignite-program
```

Hosting rewrites:
- `/api/v1/**` → Firebase Functions
- All other routes → `index.html`

---

## 9️⃣ Storage

KMFI uses a **dedicated Firebase Storage bucket** created via Firebase Console.

Deployment **does not** include storage rules at this time.

---

## 🔟 Post-Deployment Verification

### Health Checks
- Login works
- Auth token contains `apps: ["KMFI"]`
- API endpoints return 200
- Firestore reads/writes succeed
- Frontend loads without 403 / 404

### Common Debug Commands
```bash
firebase functions:log
firebase deploy --debug
```

---

## 🔁 Rollback Strategy

- Redeploy previous commit
- Firebase retains last working function versions
- Hosting rollbacks via redeploy

---

## 📌 Notes

- KMFI and MFI are deployed **within the same Firebase project**
- They are isolated by:
  - Firestore database ID
  - Auth custom claims
  - API namespaces

---

**Document Owner:** HS Advanced Technology  
**Last Updated:** 2026
# 📘 KMFI Technical Training Manual

This manual is designed to **train engineers, administrators, and technical partners** on how to operate, maintain, and support the KMFI platform.

It is written to be practical, operational, and suitable for day‑to‑day use.

---

## 1️⃣ Audience

This document is intended for:
- TechnoServe IT / Engineering teams
- Platform administrators
- Support engineers
- New developers onboarding to KMFI

This is **not** a business or end‑user guide.

---

## 2️⃣ Prerequisites

Before working on KMFI, you should be comfortable with:
- JavaScript (Node.js)
- Basic React concepts
- REST APIs
- Firebase Console
- Git & GitHub

---

## 3️⃣ Required Tooling

### Local Environment
| Tool | Version |
|---|---|
| Node.js | **20.18.2** |
| Firebase CLI | **15.4.0** |
| npm | Latest (bundled with Node) |
| Git | Latest |

Verify versions:
```bash
node -v
firebase --version
```

---

## 4️⃣ Repository Overview

```
KMFI-Web/
├── frontend/        # React admin dashboard
├── functions/       # Firebase Cloud Functions (API)
├── docs/            # Documentation
├── firebase.json
├── package.json
```

---

## 5️⃣ Frontend Training

### Location
```
frontend/
```

### Key Concepts
- Built with **React + Webpack**
- Uses **Redux** for state management
- Communicates with backend via `/api/v1/*`
- Auth token stored client-side and sent via Authorization header

### Common Tasks
- Run locally:
```bash
cd frontend
npm install
npm run start
```

- Build for production:
```bash
npm run build
```

---

## 6️⃣ Backend / Functions Training

### Location
```
functions/
```

### Runtime
- Node.js **20**
- Firebase Cloud Functions (Gen 1)
- Region: `us-central1`

### Start Emulator
```bash
cd functions
npm install
firebase emulators:start --only functions
```

---

## 7️⃣ Authentication Flow (KMFI)

1. User logs in via frontend
2. Backend validates credentials
3. Backend issues JWT
4. JWT includes:
```json
{
  "apps": ["KMFI"]
}
```
5. Frontend attaches token to all API requests


### Authorization Enforcement
Requests without `KMFI` in `apps` are rejected.

### Authorization Model (Important Clarification)

KMFI does **not** use traditional role-based access control (RBAC) such as
`admin`, `ivc`, or `company` roles.

Instead, authorization is enforced at the **application level** using JWT
custom claims.

A user is considered authorized for KMFI if their JWT contains:

```json
{
  "apps": ["KMFI"]
}
```

This design allows:
- Clear separation between KMFI and other platforms (e.g. MFI)
- Support for multi-application access in the future
- Simpler, auditable authorization logic

Any finer-grained permissions are handled implicitly by backend business logic
and data access rules, not by explicit role claims.

---

## 8️⃣ Firestore Usage

- Dedicated database: `kmfi`
- Project: `kmfi-945ef`
- Region: `nam5`

Common collections include:
- Companies
- Assessments
- Scores
- Documents

Indexes must exist for advanced queries.

---

## 9️⃣ Environment Variables

KMFI currently uses a `.env` file located at:
```
functions/.env
```

Variables in use:
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

⚠️ Never commit `.env` to source control.

---

## 🔟 Common Operational Tasks

### View Logs
```bash
firebase functions:log
```

### Redeploy Functions
```bash
firebase deploy --only functions
```

### Redeploy Hosting
```bash
firebase deploy --only hosting
```

---

## 1️⃣1️⃣ Troubleshooting Guide

### 403 Forbidden
- Missing Authorization header
- Missing `KMFI` app claim
- Frontend pointing to wrong API base URL

### Firestore Errors
- Index missing
- Wrong database ID
- Region mismatch

### Deployment Errors
- Node version mismatch
- Firebase CLI version mismatch

---

## 1️⃣2️⃣ Best Practices

- Keep Node and Firebase CLI versions pinned
- Always test in emulator before deploying
- Update documentation with every architectural change
- Keep KMFI isolated from MFI logic

---

## 📌 Final Notes

This training manual provides the **operational knowledge** required to safely manage KMFI.

For architectural context, refer to:
- HANDOVER_TECHNICAL_DOCUMENT.md
- DEPLOYMENT_RUNBOOK.md

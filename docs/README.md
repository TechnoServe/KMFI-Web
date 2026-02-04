# 📚 KMFI Documentation Index

Welcome to the official technical documentation for the **Kenya Millers Fortification Index (KMFI)** platform.

This documentation set is intended to support:
- Client handover
- Technical training
- Ongoing operations & maintenance
- Audits and reviews

All documents reflect the **current KMFI production setup** running on Firebase with Node.js 20.

---

## 📖 Core Documents

### 1️⃣ Technical Training Manual
**File:** `TECH_TRAINING_MANUAL.md`

Use this document to:
- Train new engineers or IT staff
- Understand day-to-day operations
- Learn how to run, debug, and maintain the platform

➡️ Start here if you are **operating or supporting KMFI**.

---

### 2️⃣ Handover Technical Document
**File:** `HANDOVER_TECHNICAL_DOCUMENT.md`

Use this document to:
- Understand the full system architecture
- Review old vs current setup
- Support long-term ownership and audits

➡️ Start here if you are **taking ownership of the platform**.

---

### 3️⃣ Deployment Runbook
**File:** `DEPLOYMENT_RUNBOOK.md`

Use this document to:
- Deploy KMFI to Firebase
- Perform repeatable, safe releases
- Handle rollbacks and recovery

➡️ Start here if you are **deploying or releasing KMFI**.

---

## 🧩 Architecture

### Architecture Diagram
**Location:** `architecture/`

- `mfi-architecture.png` – High-level Firebase architecture for KMFI

This diagram shows:
- Frontend (Hosting)
- Cloud Functions
- Firestore (KMFI database)
- Authentication flow
- Storage

---

## 🔐 Authentication & Authorization Model

KMFI uses **application-level authorization**, not traditional role-based access control (RBAC).

Authorization is enforced via **JWT custom claims**:

```json
{
  "apps": ["KMFI"]
}
```

- Users without the `KMFI` app claim are denied access
- KMFI is isolated from other platforms (e.g. MFI) within the same Firebase project
- Fine-grained permissions are handled in backend logic, not role claims

---

## 🛠️ Tooling & Runtime Summary

| Component | Version |
|--------|--------|
| Node.js (local) | 20.18.2 |
| Firebase Functions Runtime | nodejs20 |
| Firebase CLI | 15.4.0 |
| Functions Generation | Gen 1 |

---

## 📦 Repository Context

All documentation applies to the repository:

```
KMFI-Web/
```

Changes to architecture, runtime, or security **must be reflected in these documents**.

---

## 📌 Notes

- Formal PDF and Word exports of these documents are available for client submission
- `.env` files and secrets are intentionally excluded from documentation
- Storage rules are currently out of scope

---

**Maintained by:** HS Advanced Technology  
**Platform Owner:** TechnoServe  
**Last Updated:** 2026

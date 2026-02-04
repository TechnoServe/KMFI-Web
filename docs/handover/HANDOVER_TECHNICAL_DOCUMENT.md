## 7️⃣ Authentication & Authorization

### Authentication
- Firebase Authentication
- Email/password login
- JWT issued by backend on login

### Authorization (KMFI)
KMFI access is enforced via **custom JWT claims**:

```json
{
  "apps": ["KMFI"]
}
```

Requests without this claim are rejected.

### Authorization Model Clarification (No Role-Based Access)

KMFI does **not** implement traditional role-based access control (RBAC) such as
`admin`, `ivc`, or `company` roles.

Authorization is enforced at the **application level** using JWT custom claims.
A user is authorized to access KMFI functionality only if their JWT contains:

```json
{
  "apps": ["KMFI"]
}
```

This model was chosen to:
- Clearly isolate KMFI from other platforms (e.g. MFI)
- Support multi-application access in the future
- Reduce complexity and role sprawl
- Simplify audits and long-term maintenance

Any finer-grained access control is handled internally by backend business logic
and Firestore access patterns, not by explicit role claims.
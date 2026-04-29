# Playza Admin Security Architecture

This document outlines the multi-layered security infrastructure implemented for the Playza Admin platform.

## 🛡️ Core Security Pillars

### 1. Session Management (HttpOnly Cookies)
- **Mechanism**: Administrative tokens are delivered via `HttpOnly`, `Secure`, `SameSite: Lax` cookies.
- **Protection**: This effectively eliminates the risk of **XSS (Cross-Site Scripting)** token theft.
- **Cross-Subdomain Support**: Configured for `.playza.games`, allowing seamless movement between `admin.playza.games` and `api.playza.games`.

### 2. Interaction Hardening (Timeouts)
- **Idle Timeout**: Automated session termination after **15 minutes** of inactivity.
- **Absolute Expiry**: Mandatory re-authentication every **4 hours**.
- **Global Kill Switch**: Located in the sidebar to remotely invalidate all active sessions.

### 3. Forensic Auditing
- **Metadata Capture**: Every action automatically records:
    - **IP Address**: Origin of the request.
    - **User-Agent**: Device and browser signature.
- **Audit Logs**: Stored in the `admin_logs` table for compliance and investigation.

### 4. Step-Up Authentication (High-Risk MFA)
- **Trigger**: Sensitive actions (e.g., "Ban User") require secondary verification.
- **Flow**: Initiates an email OTP challenge that must be completed via the `SecurityChallengeModal` before the action is finalized.

---

## 🚀 Deployment & Configuration

### Supabase Requirements
Ensure the `admin_logs` table exists:
```sql
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Admin Elevation
To grant access: Change the user's `role` to `'admin'` in the database `profiles` table.

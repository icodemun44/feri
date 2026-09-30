# audit

**Purpose:** an append-only record of sensitive actions (who did what to which record, and when).

**Structure**

- `audit.repository.ts` - `AUDIT_ACTIONS`, `AUDIT_ENTITY_TYPES` and `auditRepository.record`.

**Funnel**

- Technical flow: a service inside a database transaction calls `auditRepository.record(entry, transaction)`, so the audit row is saved or rolled back together with the change it describes.

**Non-obvious rationale**

- `action` and `entity_type` are plain strings rather than database enums, so adding a new audited action never needs a migration.
